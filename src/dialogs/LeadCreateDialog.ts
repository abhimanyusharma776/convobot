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
import { IntentObject } from './interface';

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

    private async firstName (stepContext: WaterfallStepContext<IntentObject>): Promise<DialogTurnResult> {
        if (!stepContext.options.entities.some(obj => obj.entity === "fullname")){
        const messageText = 'what is the first name of the lead ';
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }
    const fullName= stepContext.options.entities.find(o => o.entity === 'fullname').value;
    var firstName = fullName.split(' ').slice(0, -1).join(' ');
    var lastName = fullName.split(' ').slice(-1).join(' ');
    lead.firstName = firstName;
    lead.lastName = lastName;
    return await stepContext.next();
    }

    private async lastName (stepContext: WaterfallStepContext<IntentObject>): Promise<DialogTurnResult> {
        if (!lead.lastName){
        lead.firstName = stepContext.result;
        const messageText = 'what is the last name of the lead ';
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt(TEXT_PROMPT, { prompt: msg }); 
    }
    return await stepContext.next();

    }

    private async company (stepContext: WaterfallStepContext<IntentObject>): Promise<DialogTurnResult> {
        console.log("intentObject",stepContext.options.entities[0],stepContext.options.entities[1],stepContext.options.entities[2],stepContext.options.entities[3])
        if(stepContext.options.entities.some(obj => obj.entity === "companyname")){
        lead.lastName = stepContext.result;
        const messageText = 'what is the company name of the lead ';
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }
        lead.company = stepContext.options.entities.find(o => o.entity === 'companyname').value;
        return await stepContext.next();
    }

    private async finalStep (stepContext: WaterfallStepContext<IntentObject>) {
        if(!lead.company){
        lead.company = stepContext.result;
        }
        try {
            const res = await makePostRequest(url + 'newLead',lead);
            await stepContext.context.sendActivity(res.statusText);
        } catch (error) {
            console.log(error);
        }
        
    }
}