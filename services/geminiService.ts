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
    const prompt = `Analyze the facial features, face shape, and hair type of the person in this image. Suggest a flattering and stylish hairstyle for them. Describe the hairstyle in a concise sentence, for example, 'a textured bob with curtain bangs' or 'a classic crew cut with a high fade'. The description should be suitable for use in another AI image generation prompt. Be direct and provide only the hairstyle description.`;
    
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
    const parts = [];
    
    // Initial instruction
    parts.push({ text: "You are an expert AI hairstylist. Your goal is to generate a hyper-realistic photo of a person with a new hairstyle." });

    // Define the new style from text or image
    if (styleInput.text) {
        parts.push({ text: `The requested new hairstyle is: "${styleInput.text}".` });
    }
    if (styleInput.image) {
        parts.push({ text: "Use this image as the reference for the new hairstyle:" });
        parts.push(base64ToPart(styleInput.image.base64, styleInput.image.mimeType));
    }
    if (!styleInput.text && !styleInput.image) {
        parts.push({ text: "Invent a new, fashionable hairstyle for the person."});
    }

    // Final instruction with the original photo
    const viewInstructions = {
        front: 'You will be transforming a front-facing portrait.',
        side: 'You will be transforming an angled, three-quarter profile photo.',
        back: 'You will be transforming a photo of the back of the head.',
    };

    let finalInstruction = `
CRITICAL FINAL INSTRUCTION - TARGET IMAGE: The image provided immediately after this instruction is the TARGET image.
Your task is to take the hairstyle defined by the style description and apply it to the person in this TARGET image.
You MUST follow these rules for the final output:
1.  **PRESERVE IDENTITY & POSE**: The person in your output image, including their head pose, camera angle, and perspective, MUST be identical to the person in the TARGET image.
2.  **PRESERVE BACKGROUND**: The background MUST be identical to the TARGET image.
3.  **CHANGE ONLY THE HAIR**: The only change should be replacing the original hair with the new hairstyle.
4.  **MATCH THE VIEW**: The output MUST be a '${view}' view, exactly matching the TARGET image's perspective. Do not show the person's face if it's not visible in the TARGET image.
    `;
    
    // Add a more forceful instruction for the back view to prevent face generation
    if (view === 'back') {
        finalInstruction = `
SPECIAL INSTRUCTION FOR BACK VIEW: The TARGET image is of the back of a person's head. The final output MUST be a view from the back, showing no face. 
${finalInstruction}
        `;
    }

    parts.push({ text: `${viewInstructions[view]} ${finalInstruction}` });
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
                    base64ToPart(photoBase64, 'image/jpeg'),
                    { text: prompt }
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
                    base64ToPart(photoBase64, 'image/jpeg'),
                    { text: prompt }
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