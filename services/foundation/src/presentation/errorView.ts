import { Axios, AxiosError } from 'axios'
import { ReasonPhrases, StatusCodes, getReasonPhrase } from 'http-status-codes'
import * as Avanzu from '@avanzu/kernel'

@Avanzu.ErrorPresenter()
export class ErrorView extends Avanzu.ErrorView {

}
