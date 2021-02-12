"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.finalizeFusebox = void 0;
function finalizeFusebox(ctx) {
    const log = ctx.log;
    log.stopStreaming();
    log.fuseFinalise();
}
exports.finalizeFusebox = finalizeFusebox;
