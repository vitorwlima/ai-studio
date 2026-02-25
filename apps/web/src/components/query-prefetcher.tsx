import { api } from "@convex/api";
import { useQuery } from "convex/react";

export const QueryPrefetcher = () => {
  useQuery(api.threads.list);
  useQuery(api.settings.hasApiKey);
  useQuery(api.settings.getMaskedApiKey);
  useQuery(api.models.listUserModels);
  useQuery(api.stripe.getUserSubscription);

  return null;
};
