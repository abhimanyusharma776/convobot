import { InputHints, MessageFactory } from "botbuilder";
import {
  DialogTurnResult,
  TextPrompt,
  WaterfallDialog,
  WaterfallStepContext,
} from "botbuilder-dialogs";
import { CancelAndHelpDialog } from "./cancelAndHelpDialog";
import { makeGetRequest } from "./Request";
import { url } from "./url";

const TEXT_PROMPT = "textPrompt";
const WATERFALL_DIALOG = "waterfallDialog";

export class ListDialog extends CancelAndHelpDialog {
  constructor(id: string) {
    super(id || "listDialog");

    this.addDialog(new TextPrompt(TEXT_PROMPT)).addDialog(
      new WaterfallDialog(WATERFALL_DIALOG, [
        this.selectEntity.bind(this),
        this.processEntity.bind(this),
      ])
    );

    this.initialDialogId = WATERFALL_DIALOG;
  }

  private async selectEntity(
    stepContext: WaterfallStepContext
  ): Promise<DialogTurnResult> {
    const messageText =
      "Which Entity do you want to select\n1.leads\n2.opportunity\n3.account\n4.contact";
    const msg = MessageFactory.text(
      messageText,
      messageText,
      InputHints.ExpectingInput
    );
    return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
  }

  private async processEntity(
    stepContext: WaterfallStepContext
  ): Promise<DialogTurnResult> {
    switch (stepContext.result) {
      case "leads":
        try {
          const res = await makeGetRequest(url + "lead");
          await stepContext.context.sendActivity(res);
        } catch (error) {
          console.log(error);
        }
        break;
      case "account":
        try {
          const res = await makeGetRequest(url + "account");
          await stepContext.context.sendActivity(res);
        } catch (error) {
          console.log(error);
        }
        break;
      case "contact":
        try {
          const res = await makeGetRequest(url + "contact");
          await stepContext.context.sendActivity(res);
        } catch (error) {
          console.log(error);
        }
        break;
      case "opportunity":
        try {
          const res = await makeGetRequest(url + "opportunity");
          await stepContext.context.sendActivity(res);
        } catch (error) {
          console.log(error);
        }
        break;
    }
    return await stepContext.endDialog();
  }
}
