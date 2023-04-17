export interface IntentObject {
  text: string;
  intent: { name: string };
  entities: any;
  text_tokens: [];
  intent_ranking: [];
  response_selector: {};
}
