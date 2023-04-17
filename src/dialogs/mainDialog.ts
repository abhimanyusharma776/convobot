// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.



import { InputHints, MessageFactory, StatePropertyAccessor, TurnContext } from 'botbuilder';


import {
    ComponentDialog,
    DialogSet,
    DialogState,
    DialogTurnResult,
    DialogTurnStatus,
    TextPrompt,
    WaterfallDialog,
    WaterfallStepContext
} from 'botbuilder-dialogs';
import { BookingDialog } from './bookingDialog';
import { FlightBookingRecognizer } from './flightBookingRecognizer';
import { ListDialog } from './ListDialog';
import { UpdateDialog } from './UpdateDialog';
import { CreateDialog } from './CreateDialog.';
import { makePostRequestRasa } from './Request';
import { rasaurl } from './url';
import { IntentObject } from './interface';

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

export class MainDialog extends ComponentDialog {
    private luisRecognizer: FlightBookingRecognizer;

    constructor(luisRecognizer: FlightBookingRecognizer, bookingDialog: BookingDialog,listDialog: ListDialog, updateDialog : UpdateDialog, createDialog: CreateDialog) {
        super('MainDialog');

        // if (!luisRecognizer) throw new Error('[MainDialog]: Missing parameter \'luisRecognizer\' is required');
        // this.luisRecognizer = luisRecognizer;

        if (!listDialog) throw new Error('[MainDialog]: Missing parameter \'listDialog\' is required');

        // Define the main dialog and its related components.
        // This is a sample "book a flight" dialog.
        this.addDialog(new TextPrompt('TextPrompt'))
            .addDialog(bookingDialog)
            .addDialog(updateDialog)
            .addDialog(listDialog)
            .addDialog(createDialog)
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.introStep.bind(this),
                this.intermedialte.bind(this),
                this.actStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a DialogContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {TurnContext} context
     */
    async run(context: TurnContext, accessor: StatePropertyAccessor<DialogState>) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(context);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    /**
     * First step in the waterfall dialog. Prompts the user for a command.
     * Currently, this expects a booking request, like "book me a flight from Paris to Berlin on march 22"
     * Note that the sample LUIS model will only recognize Paris, Berlin, New York and London as airport cities.
     */
    private async introStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        // if (!this.luisRecognizer.isConfigured) {
        //     const luisConfigMsg = 'NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.';
        //     await stepContext.context.sendActivity(luisConfigMsg, null, InputHints.IgnoringInput);
        //     return await stepContext.next();
        // }

        const messageText = (stepContext.options as any).restartMsg ? (stepContext.options as any).restartMsg : 'What can I help you with today?'+'\n'+'Here are some suggestions which will help\n1.List all <Entity>\n2.Create <entity> with <attributes>\n3.Update';
        const promptMessage = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt('TextPrompt', { prompt: promptMessage });
    }

    private async intermedialte (stepContext: WaterfallStepContext<IntentObject>): Promise<DialogTurnResult> {
        let intentObject = await makePostRequestRasa(rasaurl, stepContext.result);
        console.log(intentObject);
        if(intentObject.data.intent.name === 'fallback'){
            const didntUnderstandMessageText = `Sorry, your intent was unclear, Here are some suggestions which will help\n1.List\n2.Create\n3.Update`;
            const promptMessage = MessageFactory.text(didntUnderstandMessageText, didntUnderstandMessageText, InputHints.ExpectingInput);
            return await stepContext.prompt('TextPrompt', { prompt: promptMessage });
        }
        return await stepContext.next(intentObject);
       
    }
    

    /**
     * Second step in the waterall.  This will use LUIS to attempt to extract the origin, destination and travel dates.
     * Then, it hands off to the bookingDialog child dialog to collect any remaining details.
     */
    private async actStep(stepContext: WaterfallStepContext<IntentObject>): Promise<DialogTurnResult> {
        const myobj:IntentObject = stepContext.result.data;
        let intent;


        if(stepContext.result.data.intent.name === 'fallback')
        {
            intent = stepContext.result;
        } else {intent = stepContext.result.data.intent.name;
                intent = intent.split('_');}
        console.log(intent);
        switch (intent[0]) {
        case 'get':
            // Extract the values for the composite entities from the LUIS result.
            // const fromEntities = this.luisRecognizer.getFromEntities(luisResult);
            // const toEntities = this.luisRecognizer.getToEntities(luisResult);

            // Show a warning for Origin and Destination if we can't resolve them.
            // await this.showWarningForUnsupportedCities(stepContext.context, fromEntities, toEntities);

            // Initialize BookingDetails with any entities we may have found in the response.
            // bookingDetails.destination = toEntities.airport;
            // bookingDetails.origin = fromEntities.airport;
            // bookingDetails.travelDate = this.luisRecognizer.getTravelDate(luisResult);
            // console.log('LUIS extracted these booking details:', JSON.stringify(bookingDetails));

            // Run the BookingDialog passing in whatever details we have from the LUIS call, it will fill out the remainder.
            return await stepContext.beginDialog('listDialog',myobj);
            break;

        case 'update':
            // We haven't implemented the GetWeatherDialog so we just display a TODO message.
            // const getWeatherMessageText = 'TODO: get weather flow here';
            // await stepContext.context.sendActivity(getWeatherMessageText, getWeatherMessageText, InputHints.IgnoringInput);
            return await stepContext.beginDialog('updateDialog');
            break;
        case 'create':
            console.log("started with create");
            return await stepContext.beginDialog('createDialog',myobj);
            break;
        default:
            // Catch all for unhandled intents
            const didntUnderstandMessageText = `Sorry, I didn't get that. Please try asking in a different way (intent was)`;
            await stepContext.context.sendActivity(didntUnderstandMessageText, didntUnderstandMessageText, InputHints.IgnoringInput);
        }

        return await stepContext.next();
    }

    /**
     * This is the final step in the main waterfall dialog.
     * It wraps up the sample "book a flight" interaction with a simple confirmation.
     */
    private async finalStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        // If the child dialog ("bookingDialog") was cancelled or the user failed to confirm, the Result here will be null.
        // if (stepContext.result) {
        //     const result = stepContext.result as BookingDetails;
        //     // Now we have all the booking details.

        //     // This is where calls to the booking AOU service or database would go.

        //     // If the call to the booking service was successful tell the user.
        //     const timeProperty = new TimexProperty(result.travelDate);
        //     const travelDateMsg = timeProperty.toNaturalLanguage(new Date(Date.now()));
        //     const msg = `I have you booked to ${ result.destination } from ${ result.origin } on ${ travelDateMsg }.`;
        //     await stepContext.context.sendActivity(msg);
        // }

        // Restart the main dialog waterfall with a different message the second time around
        return await stepContext.replaceDialog(this.initialDialogId, { restartMsg: 'What else can I do for you?' });
    }
}
