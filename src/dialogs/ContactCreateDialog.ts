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
import { IntentObject } from './interface';

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

    private async firstName (stepContext: WaterfallStepContext<IntentObject>): Promise<DialogTurnResult> {
        console.log("intent object",stepContext.options.entities[0],stepContext.options.entities[1],stepContext.options.entities[2])
        if (!stepContext.options.entities.some(obj => obj.entity === "fullname")){

        const messageText = 'what is the first name of the Contact ';
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }
    const fullName= stepContext.options.entities.find(o => o.entity === 'fullname').value;
    var firstName = fullName.split(' ').slice(0, -1).join(' ');
    var lastName = fullName.split(' ').slice(-1).join(' ');
    contact.firstName = firstName;
    contact.lastName = lastName;
    return await stepContext.next();

}

    private async lastName (stepContext: WaterfallStepContext<IntentObject>): Promise<DialogTurnResult> {
       
        if (!contact.lastName){
        contact.firstName = stepContext.result;
        const messageText = 'what is the last name of the Contact ';
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }
    return await stepContext.next(contact.lastName);


}

    private async accountId (stepContext: WaterfallStepContext<IntentObject>): Promise<DialogTurnResult> {
        if(!(stepContext.options.entities.some(obj => obj.entity === "accountid"))){
        contact.lastName = stepContext.result;
        const messageText = 'what is the accountId for your Contact';
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    }
    contact.accountId=stepContext.options.entities.find(o => o.entity === 'accountid').value;
    return await stepContext.next(contact.accountId);

    }

    private async finalStep (stepContext: WaterfallStepContext) {
        if(!contact.accountId){
        contact.accountId = stepContext.result;
        }
        try {
            const res = await makePostRequest(url + 'newContact',contact);
            await stepContext.context.sendActivity(res.statusText);
        } catch (error) {
            console.log(error);
        }
        
    }
}