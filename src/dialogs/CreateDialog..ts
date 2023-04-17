import { InputHints, MessageFactory } from 'botbuilder';
import {
    DialogTurnResult,
    TextPrompt,
    WaterfallDialog,
    WaterfallStepContext
} from 'botbuilder-dialogs';
import { CancelAndHelpDialog } from './cancelAndHelpDialog';
import { LeadCreateDialog } from './LeadCreateDialog';
import { AccountCreateDialog } from './AccountCreateDialog';
import { ContactCreateDialog } from './ContactCreateDialog';
import { OpportunityCreateDialog } from './OpportunityCreateDialog';
import { IntentObject } from './interface';

const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';


export class CreateDialog extends CancelAndHelpDialog {
    constructor(id: string,leadCreateDialog: LeadCreateDialog, accountCreateDialog: AccountCreateDialog, contactCreateDialog: ContactCreateDialog, opportunityCreateDialog: OpportunityCreateDialog) {
        super(id || 'createDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(leadCreateDialog)
            .addDialog(accountCreateDialog)
            .addDialog(contactCreateDialog)
            .addDialog(opportunityCreateDialog)
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.selectEntity.bind(this),
                this.processEntity.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    private async selectEntity(stepContext: WaterfallStepContext<IntentObject>): Promise<DialogTurnResult> {
        if(!stepContext.options?.intent?.name) {
        const messageText = 'Which Entity do you want to Create \n1.leads\n2.opportunity\n3.account\n4.contact';
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        else {
            return await stepContext.next();
        }
    }

    private async processEntity(stepContext: WaterfallStepContext<IntentObject>): Promise<DialogTurnResult>  {
        const myobj:IntentObject = stepContext.options;
        let result;
        if(!myobj?.intent?.name){
      result = stepContext.result;
        }
        else {
      result = myobj.intent.name;
        }
        switch (result) {
            case 'create_lead'||'create_leads'|| 'lead'||'leads':
                return await stepContext.beginDialog('leadCreateDialog', myobj);
                break;
            case 'create_account'|| 'account':
                return await stepContext.beginDialog('accountCreateDialog', myobj);
                break;
            case 'create_opportunity'|| 'opportunity':
                return await stepContext.beginDialog('opportunityCreateDialog', myobj);
                break;
            case 'create_contact'||'contact':
                return await stepContext.beginDialog('contactCreateDialog', myobj);
                break;
        }
        return await stepContext.endDialog();
    }
    
}
