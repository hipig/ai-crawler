import { defineProxyService } from '@webext-core/proxy-service';

type DocumentMetaInfo = {
    title: string | null | undefined;
    icon: string | null | undefined;
}

class DocumentService {
    constructor(private meta: DocumentMetaInfo) {}
    getMetaInfo() {
        
        return this.meta;
    }
}

export const [registerDocumentService, getDocumentService] = defineProxyService(
    'Document', 
    (meta: DocumentMetaInfo) => new DocumentService(meta)
);