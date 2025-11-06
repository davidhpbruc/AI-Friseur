
export type AppScreen = 'welcome' | 'photo-front' | 'photo-side' | 'photo-back' | 'describe' | 'generating' | 'results';

export interface UserPhotos {
  front: string | null;
  side: string | null;
  back: string | null;
}

export interface StyleInput {
  text: string;
  image: {
    base64: string;
    mimeType: MimeType;
  } | null;
}

export interface GenerationResult {
  original: string;
  generated: string;
}

export enum MimeType {
    PNG = 'image/png',
    JPEG = 'image/jpeg',
    WEBP = 'image/webp',
}