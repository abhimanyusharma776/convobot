import axios from 'axios';
export const makePostRequest = async (path,data) => {
        let result; 
        await axios.post(path,{
        },{
            params:data,
            headers:{
                'Content-Type': 'application/json'
            }
        }).then(
             (response) => {
                 result = response;
                //  console.log(response)
             },
             (error) => {
                 console.log(error);
             }
         );
         return result;
     }
export const makeGetRequest = async (path) => {
        let result; 
        await axios.get(path).then(
             (response) => {
                 result = JSON.stringify(response.data);
             },
             (error) => {
                 console.log(error);
             }
         );
         return result;
     }

export const makePostRequestRasa = async (path, data) => {
    let result;
    let body = {
        "text": data
    }
    await axios.post(path, {
        "text": data
    }, {
        params: null,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(
        (response) => {
            result = response;
            // console.log(response)
        },
        (error) => {
            console.log(error);
        }
    );
    return result;
}