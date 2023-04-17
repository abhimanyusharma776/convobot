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
import { IntentObject } from './interface';

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

    private async name (stepContext: WaterfallStepContext<IntentObject>): Promise<DialogTurnResult> {
        if (!(stepContext.options.entities.some(obj => obj.entity === "opportunityname"))){
        const messageText = 'what is the name of opportunity ';
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        opportunity.name = stepContext.options.entities.find(o => o.entity === 'fullname').value;
        return await stepContext.next(opportunity.name);
    }

    private async stageName (stepContext: WaterfallStepContext<IntentObject>): Promise<DialogTurnResult> {
        if (!(stepContext.options.entities.some(obj => obj.entity === "stage"))){
        opportunity.name = stepContext.result;
        const messageText = 'what is the stage name of opportunity';
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }
        opportunity.stageName = stepContext.options.entities.find(o => o.entity === 'stage').value;
        return await stepContext.next(opportunity.stageName);
    }

    private async closeDate (stepContext: WaterfallStepContext<IntentObject>): Promise<DialogTurnResult> {
        if (!(stepContext.options.entities.some(obj => obj.entity === "closedate"))){
        opportunity.stageName = stepContext.result;
        const messageText = 'what is close date in format YYYY-MM-DD';
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }
        opportunity.closeDate = stepContext.options.entities.find(o => o.entity === 'closedate').value;
        return await stepContext.next(opportunity.closeDate);
    }

    private async finalStep (stepContext: WaterfallStepContext<IntentObject>) {
        if(!opportunity.closeDate){
        opportunity.closeDate = stepContext.result;
    }
        try {
            const res = await makePostRequest(url + 'newOpportunity',opportunity);
            await stepContext.context.sendActivity(res.statusText);
        } catch (error) {
            console.log(error);
        }
        
    }
}