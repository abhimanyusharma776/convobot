import { InputHints, MessageFactory } from 'botbuilder';
import {Opportunity} from './Opportunity';
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
let opportunity = new Opportunity();

export class OpportunityCreateDialog extends CancelAndHelpDialog {
    constructor(id: string) {
        super(id || 'opportunityCreateDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.name.bind(this),
                this.stageName.bind(this),
                this.closeDate.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    private async name (stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        const messageText = 'what is the name of opportunity ';
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }

    private async stageName (stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        opportunity.name = stepContext.result;
        const messageText = 'what is the stage name of opportunity';
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }

    private async closeDate (stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        opportunity.stageName = stepContext.result;
        const messageText = 'what is close date in format YYYY-MM-DD';
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }

    private async finalStep (stepContext: WaterfallStepContext) {
        opportunity.closeDate = stepContext.result;
        try {
            const res = await makePostRequest(url + 'newOpportunity',opportunity);
            await stepContext.context.sendActivity(res.statusText);
        } catch (error) {
            console.log(error);
        }
        
    }
}