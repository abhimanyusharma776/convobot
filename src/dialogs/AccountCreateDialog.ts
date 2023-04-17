import { InputHints, MessageFactory } from 'botbuilder';
import {Account} from './Account';
import { makePostRequest} from './Request';
import { url } from './url';
import {
    DialogTurnResult,
    TextPrompt,
    WaterfallDialog,
    WaterfallStepContext
} from 'botbuilder-dialogs';
import { CancelAndHelpDialog } from './cancelAndHelpDialog';

const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';
let account = new Account();

export class AccountCreateDialog extends CancelAndHelpDialog {
    constructor(id: string) {
        super(id || 'accountCreateDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.name.bind(this),
                this.shippingCity.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    private async name (stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        const messageText = 'what is the name of the account ';
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }

    private async shippingCity (stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        account.name = stepContext.result;
        const messageText = 'what is the shipping city ';
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }

    private async finalStep (stepContext: WaterfallStepContext) {
        account.shippingCity = stepContext.result;
        try {
            const res = await makePostRequest(url + 'newAccount',account);
            await stepContext.context.sendActivity(res.statusText);
        } catch (error) {
            console.log(error);
        }
        
    }
}