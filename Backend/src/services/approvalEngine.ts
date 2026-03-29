import { ApprovalRule, RuleApprover } from '@prisma/client';

/**
 * Interface representing the structure of an expense to be evaluated.
 * In a real scenario, this would come from the database or request payload.
 */
export interface EvaluationExpense {
  id: string;
  userId: string;
  amount: number;
  spentCurrency: string;
  convertedAmount: number | null;
  category: string;
}

/**
 * Interface representing the evaluation result.
 */
export interface EngineResult {
  action: 'APPROVE_INSTANT' | 'REJECT_INSTANT' | 'INITIALIZE_QUEUE';
  reason: string;
  queue?: {
    approverId: string;
    sequenceOrder: number;
    isRequired: boolean;
  }[];
}

/**
 * Approval Engine: Evaluates an expense against the relevant ApprovalRule.
 */
export class ApprovalEngine {
  
  /**
   * Main evaluation logic that generates an initial queue or instant action.
   */
  public evaluate(expense: EvaluationExpense, rule: ApprovalRule & { approvers: RuleApprover[] }): EngineResult {
    // 1. Check for immediate rejections or approvals based on global logic (if any)
    if (expense.amount < 0) {
      return {
        action: 'REJECT_INSTANT',
        reason: 'Negative expense amount is invalid.'
      };
    }

    // 2. Build the initial queue based on the rule
    const queue = [];
    let currentSequence = 1;

    // 2a. Manager-First Condition
    if (rule.isManagerApprover) {
      if (!rule.managerOverrideId && !expense.userId /* Need user's manager ID here actually */) {
         // In a full implementation, we fetch the employee's manager ID from the DB
      }
      const actualManagerId = rule.managerOverrideId || 'DIRECT_MANAGER_ID_PLACEHOLDER';
      
      queue.push({
        approverId: actualManagerId,
        sequenceOrder: currentSequence,
        isRequired: true // Manager is always required if 'Manager First' is active
      });
      
      if (rule.flowType === 'SEQUENTIAL') {
        currentSequence++;
      }
    }

    // 2b. Add custom approvers based on FlowType (Sequential vs Parallel)
    if (rule.approvers && rule.approvers.length > 0) {
      // Sort approvers by sequenceOrder just in case they are out of order
      const sortedApprovers = [...rule.approvers].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
      
      for (const approver of sortedApprovers) {
        queue.push({
          approverId: approver.approverId,
          sequenceOrder: rule.flowType === 'SEQUENTIAL' ? currentSequence + approver.sequenceOrder : 1,
          isRequired: approver.isRequired
        });
      }
    }

    // If there's no queue generated, maybe auto-approve
    if (queue.length === 0) {
      return {
        action: 'APPROVE_INSTANT',
        reason: 'No applicable rules or approvers found. Auto-approving based on policy.'
      };
    }

    return {
      action: 'INITIALIZE_QUEUE',
      reason: 'Approval queue generated successfully.',
      queue
    };
  }

  /**
   * Evaluates if a request should be rejected based on "Rejection by Required".
   * 
   * @param rule The relevant rule.
   * @param rejectedByApproverId The ID of the approver who rejected it.
   * @returns true if the entire expense should be instantly rejected.
   */
  public evaluateRejection(rule: ApprovalRule & { approvers: RuleApprover[] }, rejectedByApproverId: string): boolean {
    if (rule.isManagerApprover && (rejectedByApproverId === rule.managerOverrideId || rejectedByApproverId === 'DIRECT_MANAGER_ID_PLACEHOLDER')) {
       return true; // Direct manager rejection instantly halts everything
    }

    const approver = rule.approvers.find(a => a.approverId === rejectedByApproverId);
    if (approver && approver.isRequired) {
      return true; // Any "Required" approver rejects it instantly
    }

    return false; // If not required, maybe it can still pass based on percentage logic in partial approvals
  }

  /**
   * Calculates current approval percentage and determines if the threshold is met
   * 
   * @param rule The rule with threshold
   * @param totalApplicableApprovers Number of valid approvers in the loop
   * @param currentApprovedCount Number of approvals received
   */
  public isApprovalThresholdMet(rule: ApprovalRule, totalApplicableApprovers: number, currentApprovedCount: number): boolean {
    if (totalApplicableApprovers === 0) return true;
    const percentage = (currentApprovedCount / totalApplicableApprovers) * 100;
    return percentage >= rule.minApprovalPercentage;
  }
}
