export interface ComponentDocProp {
  readonly name: string;
  readonly description: string;
  readonly required?: boolean;
}

export interface ComponentDoc {
  readonly name: string;
  readonly description: string;
  readonly props: readonly ComponentDocProp[];
  readonly inheritedProps?: readonly string[];
  readonly example: string;
  readonly storyId: string;
}

export type ComponentDocField = keyof ComponentDoc;

export function validateComponentDoc(
  doc: Partial<ComponentDoc>,
): ComponentDocField[] {
  const fields: ComponentDocField[] = [];

  if (!doc.name?.trim()) {
    fields.push('name');
  }
  if (!doc.description?.trim()) {
    fields.push('description');
  }
  const propNames = doc.props?.map((prop) => prop.name.trim()) ?? [];
  const hasInvalidProps =
    !doc.props?.length ||
    doc.props.some((prop) => !prop.name.trim() || !prop.description.trim()) ||
    new Set(propNames).size !== propNames.length;
  if (hasInvalidProps) {
    fields.push('props');
  }
  if (
    !doc.inheritedProps?.length ||
    doc.inheritedProps.some((contract) => !contract.trim())
  ) {
    fields.push('inheritedProps');
  }
  if (!doc.example?.trim()) {
    fields.push('example');
  }
  if (!doc.storyId?.trim()) {
    fields.push('storyId');
  }

  return fields;
}
