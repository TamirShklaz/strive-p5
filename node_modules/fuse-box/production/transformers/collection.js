"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRODUCTION_TRANSFORMERS = void 0;
const WarmupPhase_Export_1 = require("./WarmupPhase_Export");
const WarmupPhase_Import_1 = require("./WarmupPhase_Import");
exports.PRODUCTION_TRANSFORMERS = [WarmupPhase_Import_1.Phase_1_ImportLink(), WarmupPhase_Export_1.Phase_1_ExportLink()];
