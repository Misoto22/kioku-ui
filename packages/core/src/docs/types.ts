export interface ComponentDoc {
  readonly name: string;
  readonly description: string;
  readonly props: readonly string[];
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
  if (!doc.props?.length) {
    fields.push('props');
  }
  if (!doc.example?.trim()) {
    fields.push('example');
  }
  if (!doc.storyId?.trim()) {
    fields.push('storyId');
  }

  return fields;
}
