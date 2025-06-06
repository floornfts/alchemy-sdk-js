/**
 * Given a REST endpoint, method, and params, sends the request with axios and
 * returns the response.
 */
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { StatsD } from 'hot-shots';

import { VERSION } from '../version';
import { IS_BROWSER } from './util';

/**
 * Helper function to send http requests using Axis.
 *
 * @private
 */
export function sendAxiosRequest<Req, Res>(
  baseUrl: string,
  restApiName: string,
  methodName: string,
  params: Req,
  overrides?: AxiosRequestConfig,
  statsD?: StatsD
): Promise<AxiosResponse<Res>> {
  const requestUrl = baseUrl + '/' + restApiName;
  const config: AxiosRequestConfig = {
    ...overrides,
    headers: {
      ...overrides?.headers,
      ...(!IS_BROWSER && { 'Accept-Encoding': 'gzip' }),
      'Alchemy-Ethers-Sdk-Version': VERSION,
      'Alchemy-Ethers-Sdk-Method': methodName
    },
    method: overrides?.method ?? 'GET',
    url: requestUrl,
    params
  };
  return axios(config)
    .then(response => {
      if (statsD) {
        statsD.increment(`alchemy-sdk.${methodName}.success`);
      }
      return response;
    })
    .catch(error => {
      if (statsD) {
        statsD.increment(`alchemy-sdk.${methodName}.error`);
      }
      throw error;
    });
}
