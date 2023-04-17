import { InputHints, MessageFactory } from 'botbuilder';
import {Contact} from './Contact';
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
let contact = new Contact();

export class ContactCreateDialog extends CancelAndHelpDialog {
    constructor(id: string) {
        super(id || 'contactCreateDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.firstName.bind(this),
                this.lastName.bind(this),
                this.accountId.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    private async firstName (stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        const messageText = 'what is the first name of the Contact ';
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }

    private async lastName (stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        contact.firstName = stepContext.result;
        const messageText = 'what is the last name of the Contact ';
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }

    private async accountId (stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        contact.lastName = stepContext.result;
        const messageText = 'what is the accountId for your Contact';
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }

    private async finalStep (stepContext: WaterfallStepContext) {
        contact.accountId = stepContext.result;
        try {
            const res = await makePostRequest(url + 'newContact',contact);
            await stepContext.context.sendActivity(res.statusText);
        } catch (error) {
            console.log(error);
        }
        
    }
}