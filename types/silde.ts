export interface Slide {
    id: string;
    imageUrl: string;
    addedBy: string;
    addedAt: string;
    event: string;
    status: number;
}
export interface SlidePage {
    content: Slide[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

