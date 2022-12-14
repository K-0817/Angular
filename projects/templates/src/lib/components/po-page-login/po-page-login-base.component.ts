import { Subscription } from 'rxjs';
import { EventEmitter, Input, OnDestroy, Output, Directive } from '@angular/core';
import { Router } from '@angular/router';

import { convertToBoolean, convertToInt, getShortBrowserLanguage, isExternalLink, isTypeof } from './../../utils/util';

import { PoLanguageService, poLocaleDefault, PoLanguage, poLanguageDefault } from '@po-ui/ng-components';

import { PoPageLogin } from './interfaces/po-page-login.interface';
import { PoPageLoginAuthenticationType } from './enums/po-page-login-authentication-type.enum';
import { PoPageLoginCustomField } from './interfaces/po-page-login-custom-field.interface';
import { PoPageLoginLiterals } from './interfaces/po-page-login-literals.interface';
import { PoPageLoginRecovery } from './interfaces/po-page-login-recovery.interface';
import { PoPageLoginService } from './po-page-login.service';

const poPageLoginContentMaxLength = 40;

export const poPageLoginLiteralsDefault = {
  en: <PoPageLoginLiterals>{
    title: 'Welcome',
    loginErrorPattern: 'Invalid Login',
    loginHint: `Your login user was given to you at your first day.
    If you don't have this information contact support`,
    loginPlaceholder: 'Insert your e-mail',
    passwordErrorPattern: 'Invalid Password',
    passwordPlaceholder: 'Insert your password',
    customFieldErrorPattern: 'Invalid value',
    customFieldPlaceholder: 'Please enter a value',
    rememberUser: 'Automatic login',
    rememberUserHint: 'You can disable this option in system configuration',
    submitLabel: 'Enter',
    submittedLabel: 'Loading...',
    forgotPassword: 'Forgot your Password?',
    highlightInfo: '',
    registerUrl: 'New register',
    titlePopover: 'Oops!',
    forgotYourPassword: 'Forgot your password?',
    ifYouTryHarder: 'If you try ',
    attempts: '{0} more time(s) ',
    yourUserWillBeBlocked:
      'without success your user will be blocked and you will be left 24 hours without being able to access :(',
    createANewPasswordNow: 'Better create a new password now! You will be able to log into the system right away.',
    iForgotMyPassword: 'I forgot my password',
    welcome: 'Welcome',
    support: 'Support'
  },
  es: <PoPageLoginLiterals>{
    title: 'Bienvenido',
    loginErrorPattern: 'Login inv??lido',
    loginHint: `Su usuario ha sido entregado para usted en su primer d??a.
    Si no tiene esta informaci??n, p??ngase en contacto con el soporte t??cnico`,
    loginPlaceholder: 'Inserte su e-mail',
    passwordErrorPattern: 'Contrase??a inv??lida',
    passwordPlaceholder: 'Inserte su contrase??a',
    customFieldErrorPattern: 'Valor no v??lido.',
    customFieldPlaceholder: 'Por favor introduzca un valor',
    rememberUser: 'Inicio de sesi??n autom??ticamente',
    rememberUserHint: 'Puede deshabilitar esta opci??n en el men?? del sistema.',
    submitLabel: 'Entrar',
    submittedLabel: 'Cargando...',
    forgotPassword: 'Olvidaste tu contrase??a?',
    highlightInfo: '',
    registerUrl: 'Nuevo registro',
    titlePopover: 'Opa!',
    forgotYourPassword: 'Olvidaste tu contrase??a?',
    ifYouTryHarder: 'Si intenta m??s ',
    attempts: '{0} vez/veces ',
    yourUserWillBeBlocked: 'sin ??xito su usuario sera bloqueado y usted v??s permanecer 24 horas sin poder acceder a :(',
    createANewPasswordNow:
      '??Mejor crear una nueva contrase??a ahora! Usted podr?? entrar en el sistema inmediatamente despu??s.',
    iForgotMyPassword: 'Olvide mi contrase??a',
    welcome: 'Bienvenido',
    support: 'Soporte'
  },
  pt: <PoPageLoginLiterals>{
    title: 'Bem-vindo',
    loginErrorPattern: 'Login inv??lido',
    loginHint: `Seu usu??rio foi entregue a voc?? no seu primeiro dia.
    Caso n??o tenha mais essa informa????o contacte o suporte`,
    loginPlaceholder: 'Insira seu e-mail',
    passwordErrorPattern: 'Senha inv??lida',
    passwordPlaceholder: 'Insira sua senha',
    customFieldErrorPattern: 'Valor inv??lido.',
    customFieldPlaceholder: 'Por favor insira um valor',
    rememberUser: 'Logar automaticamente',
    rememberUserHint: 'Voc?? pode desabilitar essa op????o no menu do sistema',
    submitLabel: 'Entrar',
    submittedLabel: 'Carregando...',
    forgotPassword: 'Esqueceu sua senha?',
    highlightInfo: '',
    registerUrl: 'Novo registro',
    titlePopover: 'Opa!',
    forgotYourPassword: 'Esqueceu sua senha?',
    ifYouTryHarder: 'Se tentar mais ',
    attempts: '{0} vez(es) ',
    yourUserWillBeBlocked: 'sem sucesso seu usu??rio ser?? bloqueado e voc?? fica 24 horas sem poder acessar :(',
    createANewPasswordNow: 'Melhor criar uma senha nova agora! Voc?? vai poder entrar no sistema logo em seguida.',
    iForgotMyPassword: 'Esqueci minha senha',
    welcome: 'Boas-vindas',
    support: 'Suporte'
  },
  ru: <PoPageLoginLiterals>{
    title: '?????????? ????????????????????!',
    loginErrorPattern: '???????????????? ??????????',
    loginHint: `?????? ?????????? ?????? ???????????????????????? ?????? ?? ???????????? ????????.
    ???????? ?? ?????? ?????? ???????? ????????????????????, ???????????????????? ?? ???????????? ??????????????????`,
    loginPlaceholder: '???????????????? ???????? ?????????? ?????????????????????? ??????????',
    passwordErrorPattern: '???????????????? ????????????',
    passwordPlaceholder: '?????????????? ???????? ????????????',
    customFieldErrorPattern: '???????????????? ????????????????.',
    customFieldPlaceholder: '????????????????????, ?????????????? ????????????????',
    rememberUser: '???????????????????????????? ????????',
    rememberUserHint: '???? ???????????? ?????????????????? ?????? ?????????? ?? ???????????????????????? ??????????????',
    submitLabel: '??????????',
    submittedLabel: '3??????????????...',
    forgotPassword: '???????????? ?????????????',
    highlightInfo: '',
    registerUrl: '?????????? ??????????????',
    titlePopover: '????!',
    forgotYourPassword: '???????????? ?????????????',
    ifYouTryHarder: '???????? ???? ???????????????????? ?????????????????????? ?????????? ?????? ',
    attempts: '{0} ??????(??) ',
    yourUserWillBeBlocked: '?????? ???????????????????????? ?????????? ????????????????????????, ?? ???? ???????????????????? ???? 24 ???????? ?????? ?????????????????????? ?????????????? :(',
    createANewPasswordNow: '?????????? ???????????????? ?????????? ???????????? ????????????!?????? ?????????????? ?????????? ?????????? ?? ??????????????.',
    iForgotMyPassword: '?? ?????????? ???????? ????????????',
    welcome: '?????????? ????????????????????',
    support: '??????????????????'
  }
};

export const poPageLoginLiteralIn = {
  en: 'in',
  es: 'en',
  pt: 'em',
  ru: '??'
};

/**
 * @description
 *
 * O componente `po-page-login` ?? utilizado como template para tela de login.
 * Com ele ?? poss??vel definirmos valores para usu??rio, senha e definir a????es para recupera????o de senha e grava????o de dados do usu??rio.
 * Tamb??m ?? poss??vel inserir uma imagem em conjunto com um texto de destaque.
 *
 *
 * A propriedade `p-authentication-url` automatiza a rotina do componente e simplifica o processo para autentica????o do usu??rio, bastando
 * definir uma url para requisi????o da autentica????o. A flexibilidade e praticidade podem chegar a um n??vel em que o desenvolvimento
 * da aplica????o no *client side* ?? desprovida de qualquer c??digo-fonte relacionado ?? rotina de login de usu??rio.
 * Seu detalhamento para uso pode ser visto logo abaixo em *propriedades*.
 * Caso julgue necess??rio, pode-se tamb??m definir manualmente a rotina do componente.
 *
 *
 * Para que as imagens sejam exibidas corretamente, ?? necess??rio incluir o caminho delas ao projeto. Para isso, edite
 * o *assets* no arquivo **angular.json** da aplica????o na seguinte ordem:
 * ```
 *   "assets": [
 *     "src/assets",
 *     "src/favicon.ico",
 *     {
 *       "glob": "**\/*",
 *       "input": "node_modules/@po-ui/style/images",
 *       "output": "assets/images"
 *     }
 *   ]
 * ```
 */
@Directive()
export abstract class PoPageLoginBaseComponent implements OnDestroy {
  /**
   * O `p-background` permite inserir uma imagem de destaque ao lado direito do formul??rio de login, caso a propriedade
   * n??o seja preenchida o formul??rio ser?? centralizado no espa??o dispon??vel.
   *
   * A fonte da imagem pode ser de um caminho local ou uma url de um servidor externo.
   *
   * Al??m da imagem, ?? poss??vel adicionar um texto informativo por cima da imagem da imagem de destaque, para isso informe
   * um valor para a literal `highlightInfo`.
   *
   * > Veja mais sobre as literais na propriedade `p-literals`.
   *
   * Exemplos de valores v??lidos:
   * - **local**: `./assets/images/login-background.png`
   * - **url externa**: `https://po-ui.io/assets/images/login-background.png`
   *
   * > Essa propriedade ?? ignorada para aplica????es mobile.
   */
  @Input('p-background') background?: string;

  /**
   * @optional
   *
   * @description
   *
   * Caminho para a logomarca localizada na parte superior.
   *
   * > Caso seja indefinida o espa??o se mant??m preservado por??m vazio.
   */
  @Input('p-logo') logo?: string;

  /**
   * @optional
   *
   * @description
   *
   * Express??o regular para validar o campo de login, caso a express??o n??o seja atentida, a literal `loginErrorPattern`
   * ser?? exibida.
   *
   * Exemplos de valores v??lidos:
   * - email: `[expressao-regular-email]`
   * - cpf: `[expressao-regular-cpf]`
   *
   * > Veja a propriedade `p-literals` para customizar a literal `loginErrorPattern`.
   */
  @Input('p-login-pattern') loginPattern?: string;

  /**
   * @optional
   *
   * @description
   *
   * Express??o regular para validar o campo de password, caso a express??o n??o seja atentida, a literal `passwordErrorPattern`
   * ser?? exibida.
   *
   * Exemplos de valores v??lidos:
   * - Apenas n??meros: `\d?`
   * - Letras m??nusculas: `\z?`
   *
   * > Veja a propriedade `p-literals` para customizar a literal `passwordErrorPattern`.
   */
  @Input('p-password-pattern') passwordPattern?: string;

  /**
   * @optional
   *
   * @description
   *
   * Caminho para a logomarca localizada no rodap??.
   */
  @Input('p-secondary-logo') secondaryLogo?: string;

  /**
   * @optional
   *
   * @description
   *
   * Evento disparado quando o usu??rio alterar o input do campo login.
   *
   * Esse evento receber?? como par??metro uma vari??vel do tipo `string` com o texto informado no campo.
   *
   * > Esta propriedade ser?? ignorada se for definido valor para a propriedade `p-authentication-url`.
   */
  @Output('p-login-change') loginChange: EventEmitter<string> = new EventEmitter<string>();

  /**
   * Evento disparado ao submeter o formul??rio de login (apertando `Enter` dentro dos campos ou pressionando o bot??o de confirma????o).
   *
   * Esse evento receber?? como par??metro um objeto do tipo `PoPageLogin` com os dados informados no formul??rio.
   *
   * > Esta propriedade ser?? ignorada se for definido valor para a propriedade `p-url-recovery`.
   *
   * > Para mais detalhes consulte a documenta????o sobre a interface `PoPageLogin` mais abaixo.
   */
  @Output('p-login-submit') loginSubmit = new EventEmitter<PoPageLogin>();

  /**
   * @optional
   *
   * @description
   *
   * Evento disparado quando o usu??rio alterar o input do campo password.
   *
   * Esse evento receber?? como par??metro uma vari??vel do tipo `string` com o texto informado no campo.
   *
   * > Esta propriedade ser?? ignorada se for definido valor para a propriedade `p-authentication-url`.
   */
  @Output('p-password-change') passwordChange: EventEmitter<string> = new EventEmitter<string>();

  /**
   * @optional
   *
   * @description
   *
   * Evento disparado quando o usu??rio alterar o idioma da p??gina.
   *
   * Esse evento receber?? como par??metro um objeto do tipo `PoLanguage` com a linguagem selecionada.
   *
   */
  @Output('p-language-change') languageChange: EventEmitter<PoLanguage> = new EventEmitter<PoLanguage>();

  allLoginErrors: Array<string> = [];
  allPasswordErrors: Array<string> = [];
  customFieldObject: PoPageLoginCustomField;
  customFieldType: string;
  loginSubscription: Subscription;
  password: string;
  rememberUser: boolean = false;
  selectedLanguage: string;
  showExceededAttemptsWarning = false;

  private _authenticationType: PoPageLoginAuthenticationType = PoPageLoginAuthenticationType.Basic;
  private _authenticationUrl: string;
  private _blockedUrl: string;
  private _contactEmail: string;
  private _customField: string | PoPageLoginCustomField;
  private _environment?: string;
  private _exceededAttemptsWarning?: number;
  private _hideRememberUser: boolean = false;
  private _literals: PoPageLoginLiterals;
  private _loading?: boolean = false;
  private _login: string;
  private _loginErrors: Array<string> = [];
  private _passwordErrors: Array<string> = [];
  private _productName: string;
  private _recovery: string | PoPageLoginRecovery | Function;
  private _registerUrl: string;
  private _support: string | Function;
  private _languagesList: Array<PoLanguage>;

  /**
   * @optional
   *
   * @description
   *
   * Ao informar um valor do tipo `string`, o mesmo ser?? aplicado como a chave do campo customizado e utilizar??
   * os valores padr??es contidos na propriedade `literals` como `customFieldErrorPattern` e `customFieldPlaceholder`.
   *
   * Existe a possibilidade de informar um objeto que segue a defini????o da interface `PoPageLoginCustomField`, onde
   * atrav??s dos par??metros enviados pode gerar um `po-input`, `po-combo` especificamente para servi??os
   * ou `po-select` para valores fixos.
   *
   * Abaixo seguem os exemplos de cada tipo de campo.
   *
   * `po-input`:
   *
   * ```
   * {
   *   property: 'domain',
   *   value: 'jv01',
   *   placeholder: 'Enter your domain',
   *   pattern: '[a-z]',
   *   errorPattern: 'Invalid value'
   * }
   * ```
   *
   * `po-combo`:
   *
   * ```
   * {
   *   property: 'domain',
   *   value: 'jv01',
   *   placeholder: 'Enter your domain',
   *   url: 'https://po-ui.io/sample/api/comboOption/domains',
   *   fieldValue: 'nickname'
   * }
   * ```
   *
   * `po-select`:
   *
   * ```
   * {
   *   property: 'domain',
   *   value: 'jv01',
   *   placeholder: 'Enter your domain',
   *   options: [{label: 'Domain 1', value: '1'}, {label: 'Domain 2', value: '2'}]
   * }
   * ```
   *
   * Caso o customField possua options, url e fieldValue preenchidos, ser?? priorizado o po-select
   * utilizando o options.
   *
   */
  @Input('p-custom-field') set customField(value: string | PoPageLoginCustomField) {
    if (value) {
      if (isTypeof(value, 'string')) {
        this.customFieldType = 'input';
        this._customField = value;
        this.customFieldObject = this.getDefaultCustomFieldObject(value);
        return;
      }

      if (isTypeof(value, 'object') && !Array.isArray(value) && value['property']) {
        this._customField = value;
        this.customFieldObject = <PoPageLoginCustomField>value;

        if (!this.customFieldObject.options && !this.customFieldObject.url) {
          this.customFieldType = 'input';
        } else {
          this.customFieldType = this.customFieldObject.options ? 'select' : 'combo';
        }

        return;
      }
    }

    this._customField = undefined;
    this.customFieldObject = undefined;
  }

  get customField(): string | PoPageLoginCustomField {
    return this._customField;
  }

  /**
   * @optional
   *
   * @description
   *
   * Personaliza o e-mail que ?? exibido na mensagem de dica de login padr??o para contato de suporte.
   */
  @Input('p-contact-email') set contactEmail(value: string) {
    this._contactEmail = value;
  }
  get contactEmail() {
    return this._contactEmail;
  }

  /**
   * @optional
   *
   * @description
   *
   * Texto customizado que fica entre a logo e a mensagem de boas-vindas.
   */
  @Input('p-product-name') set productName(value: string) {
    this._productName = value;
  }
  get productName() {
    return this._productName;
  }

  /**
   * @optional
   *
   * @description
   * Adiciona uma `tag` abaixo do t??tulo que especifica o ambiente que o usu??rio est?? fazendo o login.
   *
   * > Essa propriedade limita o texto em 40 caracteres.
   */
  @Input('p-environment') set environment(environment: string) {
    if (environment && environment.length > poPageLoginContentMaxLength) {
      this._environment = environment.substring(0, poPageLoginContentMaxLength);
    } else {
      this._environment = environment;
    }
  }
  get environment() {
    return this._environment;
  }

  /**
   * @optional
   *
   * @description
   * Exibe um aviso de bloqueio de acordo com a quantidade restante de tentativas.
   * O aviso ser?? exibido somente se a quantidade for maior que zero.
   *
   * > Caso tenha algum valor atribu??do para o atributo `p-authentication-url` e o retorno da requisi????o estiver atribuindo valor
   * para o `p-exceeded-attempts-warning`, o valor considerado ser?? o do retorno da requisi????o.
   *
   * @default `0`
   */
  @Input('p-exceeded-attempts-warning') set exceededAttemptsWarning(value: number) {
    this._exceededAttemptsWarning = convertToInt(value);
    this.showExceededAttemptsWarning = this.exceededAttemptsWarning > 0;
  }

  get exceededAttemptsWarning(): number {
    return this._exceededAttemptsWarning;
  }

  /**
   * @optional
   *
   * @description
   *
   * Esconde a fun????o "Lembrar usu??rio" do formul??rio de login.
   *
   * Quando essa propriedade ?? setada com `true` a propriedade `rememberUser` enviada no evento `p-login-submit` ser?? sempre
   * `false`.
   *
   * > Veja a propriedade `p-literals` para customizar a literal `rememberUser`.
   *
   * @default `false`
   */
  @Input('p-hide-remember-user') set hideRememberUser(value: boolean) {
    this._hideRememberUser = <any>value === '' ? true : convertToBoolean(value);

    if (this._hideRememberUser) {
      this.rememberUser = false;
    }
  }
  get hideRememberUser(): boolean {
    return this._hideRememberUser;
  }

  /**
   * @optional
   *
   * @description
   *
   * Objeto com as literais usadas no `po-page-login`.
   *
   * Existem duas maneiras de customizar o componente, passando um objeto com todas as literais dispon??veis:
   *
   * ```
   *  const customLiterals: PoPageLoginLiterals = {
   *    attempts: '{0} vez(es) ',
   *    createANewPasswordNow: 'Melhor criar uma senha nova agora! Voc?? vai poder entrar no sistema logo em seguida.',
   *    forgotPassword: 'Esqueceu sua senha?',
   *    forgotYourPassword: 'Esqueceu sua senha?',
   *    highlightInfo: '',
   *    iForgotMyPassword: 'Esqueci minha senha',
   *    ifYouTryHarder: 'Se tentar mais ',
   *    welcome: 'Boas-vindas',
   *    loginErrorPattern: 'Login obrigat??rio',
   *    loginHint: 'Caso n??o possua usu??rio entre em contato com o suporte',
   *    loginLabel: 'Insira seu usu??rio',
   *    loginPlaceholder: 'Insira seu usu??rio de acesso',
   *    passwordErrorPattern: 'Senha obrigat??ria',
   *    passwordLabel: 'Insira sua senha',
   *    passwordPlaceholder: 'Insira sua senha de acesso',
   *    customFieldErrorPattern: 'Campo customizado inv??lido',
   *    customFieldPlaceholder: 'Por favor insira um valor',
   *    registerUrl: 'Novo registro',
   *    rememberUser: 'Lembrar usu??rio',
   *    rememberUserHint: 'Esta op????o pode ser desabilitada nas configura????es do sistema',
   *    submitLabel: 'Acessar sistema',
   *    submittedLabel: 'Carregando...',
   *    titlePopover: 'Opa!',
   *    yourUserWillBeBlocked: 'sem sucesso seu usu??rio ser?? bloqueado e voc?? fica 24 horas sem poder acessar :('
   *  };
   * ```
   *
   * Ou passando apenas as literais que deseja customizar:
   *
   * ```
   *  const customLiterals: PoPageLoginLiterals = {
   *    loginPlaceholder: 'Insira seu usu??rio de acesso',
   *    passwordPlaceholder: 'Insira sua senha de acesso',
   *    submitLabel: 'Acessar sistema'
   *  };
   * ```
   *
   * E para carregar as literais customizadas, basta apenas passar o objeto para o componente.
   *
   * ```
   * <po-page-login
   *   [p-literals]="customLiterals">
   * </po-page-login>
   * ```
   *
   *  > O objeto padr??o de literais ser?? traduzido de acordo com o idioma do browser (pt, en, es).
   *  > ?? tamb??m poss??vel alternar o objeto padr??o de literais atrav??s do seletor de idiomas localizado na parte inferior do template,
   * nesse caso, h?? tamb??m a op????o do idioma russo.
   */
  @Input('p-literals') set literals(value: PoPageLoginLiterals) {
    this._literals = value;
  }

  get literals() {
    return this._literals;
  }

  /**
   * @optional
   *
   * @description
   *
   * Habilita um estado de carregamento ao bot??o de *login*.
   *
   * > ?? necess??rio atribuir `true` ?? esta propriedade na fun????o definida em `p-login-submit`.
   *
   * @default `false`
   */
  @Input('p-loading') set loading(value: boolean) {
    this._loading = convertToBoolean(value);
  }

  get loading(): boolean {
    return this._loading;
  }

  /**
   * @optional
   *
   * @description
   *
   * Valor do modelo do campo de login.
   */
  @Input('p-login') set login(value: string) {
    this._login = value;

    if (!this.authenticationUrl) {
      this.loginChange.emit(this._login);
    }
  }

  get login(): string {
    return this._login;
  }

  /**
   * @optional
   *
   * @description
   *
   * Atributo que recebe uma lista de erros e exibe abaixo do campo de login.
   */
  @Input('p-login-errors') set loginErrors(value: Array<string>) {
    this._loginErrors = value || [];
    this.setLoginErrors(this._loginErrors);
  }
  get loginErrors() {
    return this._loginErrors;
  }

  /**
   * @optional
   *
   * @description
   *
   * Atributo que recebe uma lista de erros e exibe abaixo do campo de password.
   */
  @Input('p-password-errors') set passwordErrors(value: Array<string>) {
    this._passwordErrors = value || [];
    this.setPasswordErrors(this._passwordErrors);
  }
  get passwordErrors() {
    return this._passwordErrors;
  }

  /**
   * @optional
   *
   * @description
   *
   * Exibe um link abaixo do formul??rio de login para que os usu??rios da aplica????o fa??am a recupera????o dos dados de autentica????o.
   *
   * A propriedade aceita os seguintes tipos:
   *
   * - **String**: informe uma url externa ou uma rota v??lida;
   * - **Function**: pode-se customizar a a????o. Para esta possilidade basta atribuir:
   * ```
   * <po-page-login>
   *   [recovery]="this.myRecovery.bind(this)">
   * </po-page-login>
   * ```
   *
   * - **PoPageLoginRecovery**: cria-se v??nculo autom??tico com o template **po-modal-password-recovery**.
   *   O objeto deve conter a **url** para requisi????o dos recursos e pode-se definir o **tipo** de modal para recupera????o de senha,
   *   **email** para contato e **m??scara** do campo de telefone.
   */
  @Input('p-recovery') set recovery(value: string | Function | PoPageLoginRecovery) {
    this._recovery = value;
  }

  get recovery() {
    return this._recovery;
  }

  /**
   * @optional
   *
   * @description
   *
   * Caso a aplica????o tenha um link para novos cadastros, informe uma url externa ou uma rota v??lida, dessa
   * forma ser?? exibido um link abaixo do formul??rio de login para os usu??rios da aplica????o.
   *
   * Exemplos de valores v??lidos:
   * - **local**: `/home`
   * - **url externa**: `https://po-ui.io`
   *
   * > Veja a propriedade `p-literals` para customizar a literal `registerUrl`.
   */
  @Input('p-register-url') set registerUrl(value: string) {
    this._registerUrl = isTypeof(value, 'string') ? value : undefined;
  }

  get registerUrl(): string {
    return this._registerUrl;
  }

  /**
   * @optional
   *
   * @description
   *
   * Atributo que recebe o tipo de esquema da autentica????o, sendo suportados apenas os valores `Basic` e `Bearer`.
   *
   * > Caso o tipo definido seja `Basic`, o componente far?? uma requisi????o `POST` contendo:
   *
   * ```
   * headers {
   *  Authorization: Basic base64(login:password)
   * }
   *
   * body {
   *  rememberUser: rememberUser
   * }
   * ```
   *
   * > Caso o tipo definido seja `Bearer`, o componente far?? uma requisi????o `POST` contendo:
   *
   * ```
   * body {
   *  login: login,
   *  password: base64(password),
   *  rememberUser: rememberUser
   * }
   * ```
   *
   * @default `PoPageLoginAuthenticationType.Basic`
   */
  @Input('p-authentication-type') set authenticationType(value: PoPageLoginAuthenticationType) {
    this._authenticationType = (<any>Object).values(PoPageLoginAuthenticationType).includes(value)
      ? value
      : PoPageLoginAuthenticationType.Basic;
  }

  get authenticationType(): PoPageLoginAuthenticationType {
    return this._authenticationType;
  }

  /**
   * @optional
   *
   * @description
   *
   * Endpoint usado pelo template para requisi????o do recurso. Quando preenchido, o m??todo `p-login-submit` ser?? ignorado e o
   * componente adquirir?? automatiza????o para o processo de autentica????o.
   *
   * ### Processos
   * Ao digitar um valor v??lido no campo de login/password e pressionar **Enter**, o componente far?? uma requisi????o `POST`
   * na url especificada nesta propriedade passando o objeto contendo o valor definido pelo usu??rio:
   *
   * ```
   * headers {
   *  Authorization: Basic base64(login:password)
   * }
   *
   * body {
   *  rememberUser: rememberUser
   * }
   * ```
   *
   * Em caso de **sucesso**, o objeto de retorno ?? armazenado no `sessionStorage` e o usu??rio ?? redirecionado para a p??gina inicial da
   * aplica????o `/`.
   *
   * ```
   * 200:
   *  {
   *    user: user
   *  }
   * ```
   *
   * Em caso de **erro** na autentica????o, espera-se o seguinte retorno:
   *
   * ```
   * 400/401
   *  {
   *    code: 400/401,
   *    message: message,
   *    detailedMessage: detailedMessage,
   *    helpUrl?: helpUrl
   *  }
   * ```
   *
   * > Pode-se atribuir uma quantidade m??xima de tentativas restantes (maxAttemptsRemaining) para o atributo `p-exceeded-attempts-warning`,
   * assim como os avisos relacionados aos campos login e password (loginWarnings, passwordWarnings) para os atributos `p-login-errors` e
   * `p-password-errors` conforme retorno abaixo:
   *
   * ```
   * 400
   *  {
   *    code: 400/401,
   *    message: message,
   *    detailedMessage: detailedMessage,
   *    helpUrl?: helpUrl,
   *    maxAttemptsRemaining?: maxAttemptsRemaining,
   *    loginWarnings?: [loginWarnings],
   *    passwordWarnings?: [passwordWarnings]
   *  }
   * ```
   *
   * > Caso o valor atribu??do para `p-exceeded-attempts-warning` seja igual a 0(zero), poder?? ser passado um valor para o
   * atributo `p-blocked-url` e o usu??rio ser?? redirecionado para uma tela de bloqueio.
   *
   * *Processo finalizado.*
   *
   * _______________
   *
   * #### Praticidade
   * As informa????es do servi??o de autentica????o tamb??m podem ser transmitidas diretamente pelas configura????os de rota e, desta maneira,
   * dispensa-se qualquer men????o e/ou importa????o do componente `po-page-login` no restante da aplica????o. O exemplo abaixo exemplifica
   * a forma din??mica com a qual o template de tela de login pode ser gerado ao navegar para rota `/login`, e tamb??m como ele se comunica
   * com o servi??o para efetua????o do processo de autentica????o do usu??rio e solicita????o de nova senha.
   * Basta definir nas configura????es de rota:
   *
   *
   * ```
   *   import { PoPageLoginComponent, PoPageLoginAthenticationType } from '@po-ui/ng-templates';
   *
   *   ...
   *   const routes: Routes = [
   *     {
   *       path: 'login', component: PoPageLoginComponent, data: {
   *         serviceApi: 'https://po-ui.io/sample/api/users/authentication',
   *         environment: 'development',
   *         recovery: {
   *           url: 'https://po-ui.io/sample/api/users',
   *           type: PoModalPasswordRecoveryType.All,
   *           contactMail: 'dev.po@po-ui.com',
   *           phoneMask: '9-999-999-9999'
   *         },
   *         registerUrl: '/new-password',
   *         authenticationType: PoPageLoginAthenticationType.Basic
   *       }
   *     }
   *     ...
   *   ];
   *
   *   @NgModule({
   *     imports: [RouterModule.forRoot(routes)],
   *     exports: [RouterModule]
   *   })
   *   export class AppRoutingModule { }
   * ```
   *
   *
   * O metadado `serviceApi` deve ser a **url** para requisi????o dos recursos de autentica????o, o `environment` alimenta a propriedade
   * `p-environment`, `recovery` ?? a interface `PoPageLoginRecovery` respons??vel pelas especifica????es contidas na modal de recupera????o de
   * senha, `registerUrl` alimenta a propriedade `p-register-url` e `authenticationType` que define a propriedade `p-authentication-type`.
   *
   * > ?? essencial que siga a nomenclatura dos atributos exemplificados acima para sua efetiva funcionalidade.
   *
   */
  @Input('p-authentication-url') set authenticationUrl(value: string) {
    this._authenticationUrl = isTypeof(value, 'string') ? value : undefined;
  }

  get authenticationUrl(): string {
    return this._authenticationUrl;
  }

  /**
   * @optional
   *
   * @description
   *
   * Caso o valor atribu??do para `p-exceeded-attempts-warning` seja igual a 0(zero) e a aplica????o tenha um link de bloqueio de usu??rio,
   * informe uma url externa ou uma rota v??lida, dessa forma em caso de bloqueio o usu??rio ser?? redirecionado.
   */
  @Input('p-blocked-url') set blockedUrl(value: string) {
    this._blockedUrl = isTypeof(value, 'string') ? value : undefined;
  }

  get blockedUrl(): string {
    return this._blockedUrl;
  }

  /**
   * @optional
   *
   * @description
   *
   * Exibe um bot??o para suporte.
   *
   * A propriedade aceita os seguintes tipos:
   *
   * - **String**: URL externa ou uma rota v??lida;
   * - **Function**: Fun????o a ser disparada ao clicar no bot??o de suporte;
   * ```
   * <po-page-login>
   *   [p-support]="this.mySupport.bind(this)">
   * </po-page-login>
   * ```
   *
   */
  @Input('p-support') set support(value: string | Function) {
    this._support = value;
  }

  get support() {
    return this._support;
  }

  /**
   * @optional
   *
   * @description
   *
   * Cole????o de idiomas que o componente ir?? tratar e disponibilizar?? para o usu??rio escolher.
   *
   * Caso essa propriedade n??o seja utilizada o componente mostrar?? no combo os idiomas que ele suporta por padr??o.
   *
   * Caso a cole????o tenha um idioma, a p??gina estar?? nesse idioma e n??o mostrar?? o combo.
   *
   * Caso seja passado um array vazio, a p??gina ter?? o idioma configurado no `i18n` e n??o mostrar?? o combo de sele????o.
   *
   * > Se for passado um idioma n??o suportado, ser?? preciso passar as literais pela propriedade `p-literals`.
   *
   *
   */
  @Input('p-languages') set languagesList(languagesList: Array<PoLanguage>) {
    if (languagesList) {
      if (languagesList.length) {
        this._languagesList = languagesList;
      } else {
        this._languagesList = poLanguageDefault.filter(language => language.language === this.language);
      }
    }
  }

  get languagesList(): Array<PoLanguage> {
    if (this._languagesList) {
      return this._languagesList;
    }
    return poLanguageDefault;
  }

  get showLanguage() {
    return this.languagesList.length > 1;
  }

  get language(): string {
    return this.selectedLanguage || getShortBrowserLanguage();
  }

  get pageLoginLiterals(): PoPageLoginLiterals {
    const loginHintWithContactEmail = this.contactEmail
      ? this.concatenateLoginHintWithContactEmail(this.contactEmail)
      : undefined;

    return {
      ...poPageLoginLiteralsDefault[poLocaleDefault],
      ...poPageLoginLiteralsDefault[this.language],
      ...loginHintWithContactEmail,
      ...this.literals
    };
  }

  constructor(
    private loginService: PoPageLoginService,
    public router: Router,
    public poLanguageService: PoLanguageService
  ) {
    this.selectedLanguage = this.poLanguageService.getShortLanguage();
  }

  ngOnDestroy() {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }

  closePopover() {
    this.showExceededAttemptsWarning = false;
  }

  onLoginSubmit(): void {
    const loginForm: PoPageLogin = {
      login: this.login,
      password: this.password,
      rememberUser: this.rememberUser
    };

    if (this.customField) {
      loginForm[this.customFieldObject.property] = this.customFieldObject.value;
    }

    if (this.authenticationUrl) {
      this.loading = true;
      this.loginSubscription = this.loginService
        .onLogin(this.authenticationUrl, this.authenticationType, loginForm)
        .subscribe(
          data => {
            this.setValuesToProperties();
            sessionStorage.setItem('PO_USER_LOGIN', JSON.stringify(data));
            this.openInternalLink('/');
            this.loading = false;
          },
          error => {
            if (error.error.code === '400' || error.error.code === '401') {
              this.setValuesToProperties(error);
              this.redirectBlockedUrl(this.exceededAttemptsWarning, this.blockedUrl);
            }
            this.loading = false;
          }
        );
    } else {
      this.loginSubmit.emit(loginForm);
      this.showExceededAttemptsWarning = this.exceededAttemptsWarning > 0;
    }
  }

  private getDefaultCustomFieldObject(property): PoPageLoginCustomField {
    return { property };
  }

  private openExternalLink(url: string) {
    window.open(url, '_blank');
  }

  private openInternalLink(url: string) {
    this.router.navigate([url]);
  }

  private redirectBlockedUrl(attempts: number, blockedUrl: string) {
    if (attempts === 0 && blockedUrl) {
      this.showExceededAttemptsWarning = false;
      isExternalLink(blockedUrl) ? this.openExternalLink(blockedUrl) : this.openInternalLink(blockedUrl);
    }
  }

  private setValuesToProperties(result?) {
    if (result) {
      this.exceededAttemptsWarning = result.error.maxAttemptsRemaining;
      this.loginErrors = result.error.loginWarnings;
      this.passwordErrors = result.error.passwordWarnings;
      this.blockedUrl = result.error.blockedUrl;
    } else {
      this.exceededAttemptsWarning = 0;
      this.loginErrors = [];
      this.passwordErrors = [];
      this.blockedUrl = '';
    }
  }

  protected abstract concatenateLoginHintWithContactEmail(contactEmail: string);

  protected abstract setLoginErrors(value: Array<string>): void;

  protected abstract setPasswordErrors(value: Array<string>): void;
}
