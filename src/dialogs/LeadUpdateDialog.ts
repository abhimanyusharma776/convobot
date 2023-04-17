// import { InputHints, MessageFactory } from 'botbuilder';
// import {Lead} from './Lead';
// import { makePostRequest} from './Request';
// import { url } from './url';
// import {
//     DialogTurnResult,
//     TextPrompt,
//     WaterfallDialog,
//     WaterfallStepContext
// } from 'botbuilder-dialogs';
// import { CancelAndHelpDialog } from './cancelAndHelpDialog';

// const TEXT_PROMPT = 'textPrompt';
// const WATERFALL_DIALOG = 'waterfallDialog';
// let lead = new Lead();

// export class LeadUpdateDialog extends CancelAndHelpDialog {
//     constructor(id: string) {
//         super(id || 'leadUpdateDialog');

//         this.addDialog(new TextPrompt(TEXT_PROMPT))
//             .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
//                 this.firstName.bind(this),
//                 this.lastName.bind(this),
//                 this.company.bind(this),
//                 this.finalStep.bind(this)
//             ]));

//         this.initialDialogId = WATERFALL_DIALOG;
//     }
// }