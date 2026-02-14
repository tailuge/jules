import { gateway } from "ai";
import type { ProviderType } from "./provider";

export interface AvailableModel {
  id: string;
  name: string;
  description?: string | null;
}

export async function listAvailableModelsForProvider(
  provider: ProviderType,
): Promise<AvailableModel[]> {
  if (provider === "custom") {
    return [];
  }

  const result = await gateway.getAvailableModels();
  const prefix = `${provider}/`;

  return result.models
    .filter(
      (model) =>
        model.id.startsWith(prefix) &&
        (model.modelType === "language" || model.modelType == null),
    )
    .map((model) => ({
      id: model.id,
      name: model.name,
      description: model.description,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function formatAvailableModelsMessage(
  provider: ProviderType,
  models: AvailableModel[],
): string {
  if (models.length === 0) {
    return `No models found for ${provider} in AI Gateway catalog.`;
  }

  return `Available models for ${provider}:\n${models.map((model) => `  - ${model.id}`).join("\n")}`;
}
