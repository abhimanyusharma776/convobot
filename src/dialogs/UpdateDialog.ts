import { InputHints, MessageFactory } from 'botbuilder';
import {
    DialogTurnResult,
    TextPrompt,
    WaterfallDialog,
    WaterfallStepContext
} from 'botbuilder-dialogs';
import { CancelAndHelpDialog } from './cancelAndHelpDialog';
import { Lead } from './Lead';


const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';
const lead = new Lead();

export class UpdateDialog extends CancelAndHelpDialog {
    constructor(id: string) {
        super(id || 'updateDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.selectEntity.bind(this),
                this.processEntity.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    private async selectEntity(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        const messageText = 'Which Entity do you want to update\n1.leads\n2.opportunity\n3.account\n4.contact';
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }

    private async processEntity(stepContext: WaterfallStepContext): Promise<DialogTurnResult>  {
        switch (stepContext.result) {
            case 'Lead'||'Leads':
                return await stepContext.beginDialog('leadCreateDialog');
                break;
            case 'Account':
                return await stepContext.beginDialog('accountCreateDialog');
                break;
            case 'Opportunity':
                return await stepContext.beginDialog('opportunityCreateDialog');
                break;
            case 'Contact':
                return await stepContext.beginDialog('contactCreateDialog');
                break;
        }
        return await stepContext.endDialog();
    }
}