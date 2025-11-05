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
                base64ToPart(photoBase64, 'image/jpeg'),
                { text: prompt }
            ]
        }
    });

    return response.text.trim();
}

export async function generateHairstyle(photo: string, view: 'front' | 'side' | 'back', styleInput: StyleInput): Promise<string> {
    const stylePrompt = styleInput.text 
        ? `The new hairstyle is: "${styleInput.text}".`
        : "Generate a new, fashionable hairstyle based on the reference hairstyle image provided.";

    const viewInstructions = {
        front: 'This is a front-facing portrait.',
        side: 'This is an angled, three-quarter profile view. The new hairstyle must be rendered correctly for this perspective, showing the side and part of the back of the hair.',
        back: 'This is a view from the back. The new hairstyle should be rendered from the back, showing the neckline and how the hair falls.',
    };
        
    const prompt = `You are an expert AI hairstylist. Generate a hyper-realistic photo of the person from the input image, but with a new hairstyle. ${stylePrompt} ${viewInstructions[view]} Maintain the person's identity, facial expression, and the original background as closely as possible. The new photo must be from the exact same angle as the input photo.`;

    const parts = [
        base64ToPart(photo, 'image/jpeg'),
        { text: prompt },
    ];

    if (styleInput.image) {
        parts.push(base64ToPart(styleInput.image.base64, styleInput.image.mimeType));
    }

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
}

export async function validatePhoto(photoBase64: string, view: 'front' | 'side' | 'back'): Promise<{ isValid: boolean; issue: string; }> {
    const commonPrompt = `Analyze this photo for use in an AI hairstyle app. The image must be clear, in-focus, and well-lit. The background should be simple. Based on the requirements, is this a valid photo? Return a JSON object with "isValid" (boolean) and "issue" (a concise, user-friendly string explanation if not valid, e.g., 'Image is too blurry.' or 'Please turn your head slightly to the side.').`;

    const viewPrompts = {
        front: 'The person must be looking directly at the camera. Their full face must be visible.',
        side: 'The person must be in a three-quarter profile view, not a full 90-degree side profile. Their face should be angled slightly away from the camera.',
        back: 'This must be a photo of the back of the person\'s head, showing their hair clearly.',
    };

    const prompt = `${commonPrompt} Specific requirements for this photo: ${viewPrompts[view]}`;

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