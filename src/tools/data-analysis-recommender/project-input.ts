/** The project step's inputs. The logic lives in the knowledge layer, shared with the other tools that read the whole project. */

export {
  EMPTY_TYPED_PROJECT as EMPTY_PROJECT_INPUTS,
  TYPED_MARGINS as MARGINS,
  TYPED_VARIABLE_FIELDS as VARIABLE_FIELDS,
  projectFromTyped as projectFromInputs,
  variablesFromTyped as variablesFromInputs,
  type TypedProject as ProjectInputs,
} from "../../knowledge/research";
