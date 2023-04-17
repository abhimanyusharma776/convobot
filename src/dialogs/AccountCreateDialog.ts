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
import { IntentObject } from './interface';


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

    private async name (stepContext: WaterfallStepContext<IntentObject>): Promise<DialogTurnResult> {
        console.log("intent object",stepContext.options.entities[0],stepContext.options.entities[1])
        if (!stepContext.options.entities.some(obj => obj.entity === "accountname")){
            const messageText = 'what is the name of the account ';
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
      }
      const accountName= stepContext.options.entities.find(o => o.entity === 'accountname').value;
      account.name=accountName;
      return await stepContext.next(account.name);

          }

    private async shippingCity (stepContext: WaterfallStepContext<IntentObject>): Promise<DialogTurnResult> {
        if (!stepContext.options.entities.some(obj => obj.entity === "shippingcity")){
            account.name = stepContext.result;
            const messageText = 'what is the shipping city ';
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    
        }

        account.shippingCity=stepContext.options.entities.find(o => o.entity === 'shippingcity').value;
        return await stepContext.next(account.shippingCity);

            }

    private async finalStep (stepContext: WaterfallStepContext) {
       if(!account.shippingCity){
        account.shippingCity = stepContext.result;
       }
        try {
            const res = await makePostRequest(url + 'newAccount',account);
            await stepContext.context.sendActivity(res.statusText);
        } catch (error) {
            console.log(error);
        }
        
    }
}