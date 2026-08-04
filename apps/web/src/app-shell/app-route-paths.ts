export function objectPath(objectId: string): string {
  return `/objects/${objectId}`;
}

export function objectDocumentsPath(objectId: string): string {
  return `${objectPath(objectId)}/documents`;
}

export function objectSectionsPath(objectId: string): string {
  return `${objectPath(objectId)}/sections`;
}

export function sectionPath(objectId: string, sectionId: string): string {
  return `${objectSectionsPath(objectId)}/${sectionId}`;
}

export function sectionTemplatePath(objectId: string, sectionId: string): string {
  return `${sectionPath(objectId, sectionId)}/template`;
}

export function sectionFinalPath(objectId: string, sectionId: string): string {
  return `${sectionPath(objectId, sectionId)}/final`;
}

export function folderPath(objectId: string, sectionId: string, folderId: string): string {
  return `${sectionPath(objectId, sectionId)}/folders/${folderId}`;
}

export function aosrPath(
  objectId: string,
  sectionId: string,
  folderId: string,
  draftId: string,
): string {
  return `${folderPath(objectId, sectionId, folderId)}/aosr/${draftId}`;
}
