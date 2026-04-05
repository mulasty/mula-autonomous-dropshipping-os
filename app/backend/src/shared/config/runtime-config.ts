export interface SupplierIntakeRuntimeConfig {
  createExceptionOnZeroAccepted: boolean;
  warningThresholdRatio: number;
}

export interface QualificationRuntimeConfig {
  enableAiReview: boolean;
  createHighPriorityReviewExceptions: boolean;
}

export interface OrderRoutingRuntimeConfig {
  allowedPaymentStatuses: string[];
  supportedCountries: string[];
  createExceptionOnValidationFailure: boolean;
}

export interface AppRuntimeConfig {
  environment: string;
  supplierIntake: SupplierIntakeRuntimeConfig;
  qualification: QualificationRuntimeConfig;
  orderRouting: OrderRoutingRuntimeConfig;
}

export const defaultRuntimeConfig: AppRuntimeConfig = {
  environment: "development",
  supplierIntake: {
    createExceptionOnZeroAccepted: true,
    warningThresholdRatio: 0.2
  },
  qualification: {
    enableAiReview: false,
    createHighPriorityReviewExceptions: true
  },
  orderRouting: {
    allowedPaymentStatuses: ["authorized", "paid"],
    supportedCountries: [],
    createExceptionOnValidationFailure: true
  }
};
