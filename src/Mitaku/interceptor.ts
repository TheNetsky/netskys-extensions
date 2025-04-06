import { PaperbackInterceptor, Request, Response } from "@paperback/types";
import { MitakuExtension } from "./main";

export class Interceptor extends PaperbackInterceptor {
    source: MitakuExtension;

    constructor(id: string, source: MitakuExtension) {
        super(id);
        this.source = source;
    }

    override async interceptRequest(request: Request): Promise<Request> {
        request.headers = {
            ...(request.headers ?? {}),
            ...{
                "user-agent": await Application.getDefaultUserAgent(),
                referer: `${this.source.domain}/`,
            },
        };

        request.cookies = {
            ...(request.cookies ?? {})
        };

        return request;
    }

    override async interceptResponse(request: Request, response: Response, data: ArrayBuffer,): Promise<ArrayBuffer> {
        return data;
    }
}