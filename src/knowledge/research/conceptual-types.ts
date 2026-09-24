/**
 * The conceptual framework data model: variables, the relationships between them,
 * and any positions the researcher has set by moving boxes. It is stored in the
 * project draft, so later tools read the same framework rather than a copy.
 */

export const VARIABLE_TYPES = ["independent", "dependent", "mediator", "moderator", "control", "extraneous"] as const;
export type VariableType = (typeof VARIABLE_TYPES)[number];

export const VARIABLE_TYPE_LABELS: Readonly<Record<VariableType, string>> = {
  independent: "Independent variable",
  dependent: "Dependent variable",
  mediator: "Mediator",
  moderator: "Moderator",
  control: "Control variable",
  extraneous: "Extraneous variable",
};

export const RELATIONSHIP_TYPES = ["direct", "indirect", "moderation", "mediation", "association", "correlation", "influence"] as const;
export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

/** How a connector is drawn. Every style differs in shape, not colour alone. */
export interface ConnectorStyle {
  /** "one-way": arrowhead at the target; "two-way": at both ends; "none": a plain line. */
  arrows: "one-way" | "two-way" | "none";
  /** Dash pattern in diagram units, or null for a solid line. */
  dash: readonly number[] | null;
}

export interface RelationshipTypeInfo {
  label: string;
  /** What the relationship claims, completing "X … Y". */
  verb: string;
  meaning: string;
  style: ConnectorStyle;
}

export const RELATIONSHIP_TYPE_INFO: Readonly<Record<RelationshipType, RelationshipTypeInfo>> = {
  direct: {
    label: "Direct effect",
    verb: "has a direct effect on",
    meaning: "One variable is expected to affect another directly.",
    style: { arrows: "one-way", dash: null },
  },
  indirect: {
    label: "Indirect effect",
    verb: "has an indirect effect on",
    meaning: "One variable is expected to affect another through a third variable.",
    style: { arrows: "one-way", dash: [8, 5] },
  },
  moderation: {
    label: "Moderation",
    verb: "moderates",
    meaning: "A variable is expected to change the strength or direction of a relationship.",
    style: { arrows: "one-way", dash: null },
  },
  mediation: {
    label: "Mediation",
    verb: "is linked through mediation to",
    meaning: "Part of a path in which one variable affects another through a mediator.",
    style: { arrows: "one-way", dash: null },
  },
  association: {
    label: "Association",
    verb: "is associated with",
    meaning: "Two variables are expected to be related, without a direction of influence.",
    style: { arrows: "none", dash: null },
  },
  correlation: {
    label: "Correlation",
    verb: "is correlated with",
    meaning: "Two variables are expected to vary together.",
    style: { arrows: "two-way", dash: null },
  },
  influence: {
    label: "Influence",
    verb: "influences",
    meaning: "One variable is expected to influence another, without claiming a direct causal effect.",
    style: { arrows: "one-way", dash: [2, 4] },
  },
};

export interface FrameworkVariable {
  id: string;
  name: string;
  /** The text shown in the box. Defaults to the name. */
  shortLabel: string;
  description: string;
  type: VariableType;
}

export interface FrameworkRelationship {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  /** Shown centred on the connector, such as "H1 (+)". */
  label: string | null;
  /** For a moderation: the relationship being moderated, so the arrow points at its connector. */
  moderates: string | null;
  /** The project hypotheses this relationship represents. Empty for relationships the researcher added. */
  hypothesisIds: readonly string[];
}

export interface Point {
  x: number;
  y: number;
}

export interface ConceptualFramework {
  variables: readonly FrameworkVariable[];
  relationships: readonly FrameworkRelationship[];
  /** Positions set by moving boxes, by variable id. Variables not listed use the automatic layout. */
  positions: Readonly<Record<string, Point>>;
}

export const EMPTY_FRAMEWORK: ConceptualFramework = { variables: [], relationships: [], positions: {} };
