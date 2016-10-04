import AWS from 'aws-sdk'
import CONFIG from './config.json'

const { region, accessKeyId, secretAccessKey, FunctionName } = CONFIG.lambda
const Lambda = new AWS.Lambda({ region, accessKeyId, secretAccessKey })

export const lambdaPromise = params => {
  return new Promise((resolve, reject) => {
    const lambdaCallback = (error, results) => {
      if (error) reject(error)
      resolve(results.Payload)
    }

    Lambda.invoke(params, lambdaCallback)
  })
}

export const invokeLambda = payload => {
  console.log('running to lambda...')
  const json = JSON.stringify(payload)
  return lambdaPromise({
    FunctionName,
    Payload: json
  })
}

export const handler = (payload)  => {
  return invokeLambda(payload)
    // .then(response => JSON.parse(response))
    .then(results => {
      console.log(results)
      return results
    })
    .catch(error => {throw error})
}
