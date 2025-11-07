import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { StyleInput } from '../types';

// FIX: API key must be obtained exclusively from process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const imageModel = 'gemini-2.5-flash-image';
const textModel = 'gemini-2.5-flash';

function base64ToPart(base64: string, mimeType: string) {
    return {
        inlineData: {
            data: base64.split(',')[1],
            mimeType,
        },
    };
}

export async function suggestStyle(photoBase64: string): Promise<string> {
    const prompt = `Based on the person's facial features and face shape in the photo, suggest a single, highly flattering hairstyle. Your description should be detailed, clear, and ready to be used as a high-quality prompt for an AI image generator. For example: "A soft, layered lob cut with warm honey-blonde highlights and gentle, face-framing waves." Do not add any conversational text, just the hairstyle description.`;
    
    const response = await ai.models.generateContent({
        model: textModel,
        contents: {
            parts: [
                { text: prompt },
                base64ToPart(photoBase64, 'image/jpeg')
            ]
        }
    });

    return response.text.trim();
}

export async function generateHairstyle(
    photo: string, 
    view: 'front' | 'side' | 'back', 
    styleInput: StyleInput
): Promise<string> {
    const parts: (string | { inlineData: { data: string; mimeType: string; }; } | { text: string; })[] = [];

    // A simpler, more direct prompt structure that is more robust.
    let prompt = `Your task is to edit the target person's photo to give them a new hairstyle as described.

**New Hairstyle:** "${styleInput.text}"

**Strict Rules:**
1.  **Preserve the person's identity.** Their face, expression, and pose must not change.
2.  **Preserve the background.** The background must remain identical.
3.  **Only change the hair.** Replace the original hair with the new style.
4.  **Match the view.** The output must be a '${view}' view, exactly matching the target photo's perspective.
`;

    if (styleInput.image) {
        // If there's a reference image, add it before the text prompt.
        // This pattern (visual context first) is often effective.
        parts.push(base64ToPart(styleInput.image.base64, styleInput.image.mimeType));
        prompt += `\nThe image provided before this text is a visual reference for the hairstyle. Use it as a guide for the cut, color, and texture, but DO NOT copy the person or background from it. The text description is the main instruction.`
    }

    // Add the consolidated text prompt.
    parts.push({ text: prompt });
    
    // Add the user's photo (the target image) last.
    parts.push(base64ToPart(photo, 'image/jpeg'));

    try {
        const response = await ai.models.generateContent({
            model: imageModel,
            contents: { parts: parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        // FIX: Improved image response parsing to be more robust.
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
    
        throw new Error(`Image generation failed for the ${view} view.`);

    } catch(error: any) {
        console.error(`Error in generateHairstyle for view: ${view}`, error);
        // Check for safety-related response, which might not be a thrown error but a response property.
        if (error.message?.includes('SAFETY')) {
            throw new Error('SAFETY_VIOLATION');
        }
        throw new Error(`Image generation failed for the ${view} view.`);
    }
}

export async function validatePhoto(photoBase64: string, view: 'front' | 'side' | 'back'): Promise<{ isValid: boolean; issue: string; }> {
    const viewSpecificRules = {
        front: `
- **View-Specific Rule (Front)**: The person should be looking mostly towards the camera. Their face should be generally centered.
  - Bad Example: Head is turned completely to the side. Issue: "Please face the camera more directly."
  - Bad Example: Face is at the very edge of the photo. Issue: "Please try to center your face."`,
        side: `
- **View-Specific Rule (Side)**: The photo should be a 'three-quarter view'. The head should be turned to the side, but not a full 90-degree profile. The goal is to see the shape of the jaw and cheekbone.
  - Good Example: You can see the corner of the far eye and the bridge of the nose.
  - Bad Example (Too much turn): It's a full profile view. Issue: "Please turn your head back towards the camera a little."
  - Bad Example (Not enough turn): It looks almost front-facing. Issue: "Please turn your head a little more to the side."`,
        back: `
- **View-Specific Rule (Back)**: The photo must clearly show the back of the head and hair.
  - Bad Example: The person is turned so you can see their face. Issue: "Please show the back of your head."`
    };

    const prompt = `Your task is to act as a helpful photo assistant for an AI hairstyle app. Your goal is to guide the user to take a good photo. Be a little lenient, but reject photos that will lead to a bad result. Analyze the photo based on the required view: '${view}'.

Check for these issues in order of priority:
1.  **General Rules (All Views)**:
    -   Is the person's head/face visible and mostly in focus? Issue: "The photo is too blurry, please retake."
    -   Is the lighting usable (not pitch black or completely washed out)? Issue: "The photo is too dark or bright. Please find better lighting."

2.  **View-Specific Rules**:
    ${viewSpecificRules[view]}

Return a JSON object with "isValid" (boolean) and "issue" (a brief, user-friendly, actionable explanation if not valid). Be specific in your feedback. If multiple issues exist, report the most important one. If the photo is good, set "isValid" to true and "issue" to an empty string.
Analyze the provided photo.`;

    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: {
                parts: [
                    { text: prompt },
                    base64ToPart(photoBase64, 'image/jpeg')
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isValid: { type: Type.BOOLEAN },
                        issue: { type: Type.STRING },
                    },
                    required: ['isValid', 'issue']
                },
            },
        });

        const result = JSON.parse(response.text.trim());
        
        if (typeof result.isValid === 'boolean' && typeof result.issue === 'string') {
            return result;
        } else {
            console.error("Malformed validation response from AI:", result);
            return { isValid: false, issue: "Could not validate the photo. Please try again." };
        }

    } catch (e) {
        console.error("Error validating photo with AI:", e);
        return { isValid: false, issue: "An error occurred during validation. Please check your connection and try again." };
    }
}

export async function validateStyleImage(photoBase64: string): Promise<{ isValid: boolean; issue: string; }> {
    const prompt = `Your task is to validate if this image is a suitable reference for an AI hairstyle generation app. The image should be clear and show a distinct hairstyle.

Check for these issues in order of priority:
1.  **Clarity**: Is the image very blurry or low quality? Issue: "The reference photo is too blurry to use."
2.  **Content**: Does the image clearly show a hairstyle on a person or mannequin? Issue: "Please upload a photo that clearly shows a hairstyle."
3.  **Safety**: Is the image inappropriate? Issue: "This reference image cannot be used. Please choose another."

Return a JSON object with "isValid" (boolean) and "issue" (a brief, user-friendly explanation if not valid). If the image is good, set "isValid" to true and "issue" to an empty string. Analyze the provided photo.`;

    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: {
                parts: [
                    { text: prompt },
                    base64ToPart(photoBase64, 'image/jpeg')
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isValid: { type: Type.BOOLEAN },
                        issue: { type: Type.STRING },
                    },
                    required: ['isValid', 'issue']
                },
            },
        });
        
        const result = JSON.parse(response.text.trim());
        if (typeof result.isValid === 'boolean' && typeof result.issue === 'string') {
            return result;
        } else {
            console.error("Malformed validation response from AI:", result);
            return { isValid: false, issue: "Could not validate the style photo. Please try again." };
        }

    } catch (e) {
        console.error("Error validating style photo with AI:", e);
        return { isValid: false, issue: "An error occurred during style photo validation. Please try again." };
    }
}