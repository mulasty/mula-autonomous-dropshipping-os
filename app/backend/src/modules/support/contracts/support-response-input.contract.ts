import { SupportClassificationOutput } from "./support-classification-output.contract";
import {
  SupportOrderContext,
  SupportProductContext,
  SupportTrackingContext
} from "./support-classification-input.contract";

export interface SupportResponseInput {
  classification: SupportClassificationOutput;
  messageText?: string;
  orderContext?: SupportOrderContext;
  trackingContext?: SupportTrackingContext;
  productContext?: SupportProductContext;
  sendMode?: "draft_only" | "auto_send_allowed";
  promptVersion?: string;
}
