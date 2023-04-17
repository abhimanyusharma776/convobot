import { InputHints, MessageFactory } from 'botbuilder';
import {Lead} from './Lead';
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
let lead = new Lead();

export class LeadCreateDialog extends CancelAndHelpDialog {
    constructor(id: string) {
        super(id || 'leadCreateDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.firstName.bind(this),
                this.lastName.bind(this),
                this.company.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    private async firstName (stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        const messageText = 'what is the first name of the lead ';
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }

    private async lastName (stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        lead.firstName = stepContext.result;
        const messageText = 'what is the last name of the lead ';
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }

    private async company (stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        lead.lastName = stepContext.result;
        const messageText = 'what is the company name of the lead ';
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }

    private async finalStep (stepContext: WaterfallStepContext) {
        lead.company = stepContext.result;
        try {
            const res = await makePostRequest(url + 'newLead',lead);
            await stepContext.context.sendActivity(res.statusText);
        } catch (error) {
            console.log(error);
        }
        
    }
}