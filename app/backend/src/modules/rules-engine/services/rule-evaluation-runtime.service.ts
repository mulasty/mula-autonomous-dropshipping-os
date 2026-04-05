import { LoadedRulesPolicy, PolicyLoader } from "../../policy-loader";
import { RuleEvaluationInput } from "../contracts/rule-evaluation-input.contract";
import { RuleEvaluationOutput } from "../contracts/rule-evaluation-output.contract";
import {
  PersistedProductRuleDecision,
  ProductRuleDecisionRepository
} from "../repositories/product-rule-decision.repository";
import { ProductRulesEngineService } from "./product-rules-engine.service";

export interface RuleEvaluationRuntimeInput {
  evaluationInput: RuleEvaluationInput;
  persistDecision?: boolean;
}

export interface RuleEvaluationRuntimeResult {
  decision: RuleEvaluationOutput;
  loadedPolicy: LoadedRulesPolicy;
  persistedDecision: PersistedProductRuleDecision | null;
}

export class RuleEvaluationRuntimeService {
  constructor(
    private readonly rulesEngine: ProductRulesEngineService,
    private readonly policyLoader: PolicyLoader,
    private readonly ruleDecisionRepository?: ProductRuleDecisionRepository
  ) {}

  async evaluate(
    input: RuleEvaluationRuntimeInput
  ): Promise<RuleEvaluationRuntimeResult> {
    const loadedPolicy = await this.policyLoader.loadRulesPolicy(
      input.evaluationInput.policyContext
    );

    const decision = this.rulesEngine.evaluate({
      ...input.evaluationInput,
      policyContext: loadedPolicy.policy
    });

    const persistedDecision =
      input.persistDecision && this.ruleDecisionRepository
        ? await this.ruleDecisionRepository.saveDecision(decision)
        : null;

    return {
      decision,
      loadedPolicy,
      persistedDecision
    };
  }
}
