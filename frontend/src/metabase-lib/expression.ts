import { t } from "ttag";

import * as ML from "cljs/metabase.lib.js";

import { breakouts } from "./breakout";
import { displayInfo } from "./metadata";
import type {
  AggregationClause,
  ColumnMetadata,
  ExpressionArg,
  ExpressionClause,
  ExpressionOperatorName,
  ExpressionOptions,
  ExpressionParts,
  FilterClause,
  JoinCondition,
  Query,
} from "./types";

type ErrorWithMessage = {
  message: string;
  friendly?: boolean;
};

export function expression(
  query: Query,
  stageIndex: number,
  expressionName: string,
  clause: ExpressionClause,
): Query {
  return ML.expression(query, stageIndex, expressionName, clause);
}

export function withExpressionName<
  Clause extends AggregationClause | ExpressionClause,
>(clause: Clause, newName: string): Clause {
  return ML.with_expression_name(clause, newName);
}

export function expressions(
  query: Query,
  stageIndex: number,
): ExpressionClause[] {
  return ML.expressions(query, stageIndex);
}

export function expressionableColumns(
  query: Query,
  stageIndex?: number,
  expressionPosition?: number,
): ColumnMetadata[] {
  return ML.expressionable_columns(query, stageIndex, expressionPosition);
}

export function expressionParts(
  query: Query,
  stageIndex: number,
  clause: AggregationClause | ExpressionClause | FilterClause | JoinCondition,
): ExpressionParts {
  return ML.expression_parts(query, stageIndex, clause);
}

export function expressionClause(
  operator: ExpressionOperatorName,
  args: (ExpressionArg | AggregationClause | ExpressionClause | FilterClause)[],
  options: ExpressionOptions | null = null,
): ExpressionClause {
  return ML.expression_clause(operator, args, options);
}

export function expressionClauseForLegacyExpression(
  query: Query,
  stageIndex: number,
  mbql: any,
): ExpressionClause {
  return ML.expression_clause_for_legacy_expression(query, stageIndex, mbql);
}

export function legacyExpressionForExpressionClause(
  query: Query,
  stageIndex: number,
  expressionClause: ExpressionClause | AggregationClause | FilterClause,
): any {
  return ML.legacy_expression_for_expression_clause(
    query,
    stageIndex,
    expressionClause,
  );
}

export type ExpressionMode = "expression" | "aggregation" | "filter";
export function diagnoseExpression(
  query: Query,
  stageIndex: number,
  expressionMode: ExpressionMode,
  mbql: any,
  expressionPosition?: number,
): ErrorWithMessage | null {
  return ML.diagnose_expression(
    query,
    stageIndex,
    expressionMode,
    mbql,
    expressionPosition,
  );
}

export function offsetClause(
  query: Query,
  stageIndex: number,
  clause: AggregationClause | ExpressionClause,
  offset: number,
): ExpressionClause {
  const period = getPeriodName(query, stageIndex);
  const { displayName } = displayInfo(query, stageIndex, clause);
  const newName = t`${displayName} (previous ${period})`;
  const newClause = expressionClause("offset", [clause, offset], {
    name: newName,
    "display-name": newName,
  });
  return newClause;
}

export function getPeriodName(query: Query, stageIndex: number): string {
  const firstTimeBreakout = breakouts(query, stageIndex).find(breakout => {
    const info = displayInfo(query, stageIndex, breakout);
    return info.effectiveType === "type/DateTime"; // TODO: this should be inside MLv2
  });

  if (!firstTimeBreakout) {
    return t`period`;
  }

  const firstTimeBreakoutInfo = displayInfo(
    query,
    stageIndex,
    firstTimeBreakout,
  );

  const period = firstTimeBreakoutInfo.longDisplayName.split(":").at(-1);

  return period ? period.trim().toLowerCase() : t`period`;
}
