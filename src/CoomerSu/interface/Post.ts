export interface Post {
    id: string;
    user: string;
    service: string;
    title: string;
    content: string;
    embed: any;
    shared_file: boolean;
    added: Date;
    published: Date;
    edited: null;
    file: {
        name: string;
        path: string;
    };
    attachments: Attachment[];
    poll: null;
    captions: null;
    tags: null;
    next: string;
    prev: string;
}

export interface Attachment {
    name: string;
    path: string;
}