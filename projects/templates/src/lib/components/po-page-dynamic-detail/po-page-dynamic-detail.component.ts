import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Route, Router, ActivatedRoute } from '@angular/router';

import { Subscription, concat, EMPTY, Observable, throwError, of } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';

import {
  PoBreadcrumb,
  PoDialogConfirmOptions,
  PoDialogService,
  PoLanguageService,
  PoNotificationService,
  PoPageAction,
  poLocaleDefault
} from '@po-ui/ng-components';

import { convertToBoolean, mapObjectByProperties, valuesFromObject } from '../../utils/util';

import { PoPageDynamicDetailActions } from './interfaces/po-page-dynamic-detail-actions.interface';
import { PoPageDynamicDetailField } from './interfaces/po-page-dynamic-detail-field.interface';
import { PoPageDynamicService } from '../../services/po-page-dynamic/po-page-dynamic.service';
import { PoPageDynamicDetailActionsService } from './po-page-dynamic-detail-actions.service';
import { PoPageDynamicDetailOptions } from './interfaces/po-page-dynamic-detail-options.interface';
import { PoPageCustomizationService } from './../../services/po-page-customization/po-page-customization.service';
import { PoPageDynamicOptionsSchema } from './../../services/po-page-customization/po-page-dynamic-options.interface';
import { PoPageDynamicDetailMetaData } from './interfaces/po-page-dynamic-detail-metadata.interface';
import { PoPageDynamicDetailBeforeBack } from './interfaces/po-page-dynamic-detail-before-back.interface';
import { PoPageDynamicDetailBeforeRemove } from './interfaces/po-page-dynamic-detail-before-remove.interface';
import { PoPageDynamicDetailBeforeEdit } from './interfaces/po-page-dynamic-detail-before-edit.interface';

type UrlOrPoCustomizationFunction = string | (() => PoPageDynamicDetailOptions);

export const poPageDynamicDetailLiteralsDefault = {
  en: {
    pageActionEdit: 'Edit',
    pageActionRemove: 'Delete',
    pageActionBack: 'Back',
    confirmRemoveTitle: 'Confirm delete',
    confirmRemoveMessage: 'Are you sure you want to delete this record? You can not undo this action.',
    removeNotificationSuccess: 'Item deleted successfully.',
    registerNotFound: 'Register not found.'
  },
  es: {
    pageActionEdit: 'Editar',
    pageActionRemove: 'Borrar',
    pageActionBack: 'Regreso',
    confirmRemoveTitle: 'Confirmar la exclusi??n',
    confirmRemoveMessage: '??Est?? seguro de que desea eliminar este registro? No puede deshacer esta acci??n.',
    removeNotificationSuccess: 'Elemento eliminado con ??xito.',
    registerNotFound: 'Registro no encontrado.'
  },
  pt: {
    pageActionEdit: 'Editar',
    pageActionRemove: 'Excluir',
    pageActionBack: 'Voltar',
    confirmRemoveTitle: 'Confirmar exclus??o',
    confirmRemoveMessage: 'Tem certeza de que deseja excluir esse registro? Voc?? n??o poder?? desfazer essa a????o.',
    removeNotificationSuccess: 'Item exclu??do com sucesso.',
    registerNotFound: 'Registro n??o encontrado.'
  },
  ru: {
    pageActionEdit: '??????????????????????????',
    pageActionRemove: '??????????????',
    pageActionBack: '??????????',
    confirmRemoveTitle: '?????????????????????????? ????????????????',
    confirmRemoveMessage: '???? ??????????????, ?????? ???????????? ?????????????? ?????? ?????????????  ???? ???? ???????????? ???????????????? ?????? ????????????????.',
    removeNotificationSuccess: '?????????????? ?????????????? ????????????.',
    registerNotFound: '???????????? ???? ??????????????.'
  }
};

/**
 * @description
 *
 * O `po-page-dynamic-detail` ?? uma p??gina que serve para exibir registros em detalhes,
 * o mesmo tamb??m suporta metadados conforme especificado na documenta????o.
 *
 *
 * ### Utiliza????o via rota
 *
 * Ao utilizar as rotas para carregar o template, o `page-dynamic-detail` disponibiliza propriedades para
 * poder especificar o endpoint dos dados e dos metadados. Exemplo de utiliza????o:
 *
 * O componente primeiro ir?? carregar o metadado da rota definida na propriedade serviceMetadataApi
 * e depois ir?? buscar da rota definida na propriedade serviceLoadApi.
 *
 * > Caso o servidor retornar um erro ao recuperar o metadados, ser?? repassado o metadados salvo em cache,
 * se o cache n??o existe ser?? disparado uma notifica????o.
 *
 * ```
 * {
 *   path: 'people/:id',
 *   component: PoPageDynamicDetailComponent,
 *   data: {
 *     serviceApi: 'http://localhost:3000/v1/people', // endpoint dos dados
 *     serviceMetadataApi: 'http://localhost:3000/v1/metadata', // endpoint dos metadados
 *     serviceLoadApi: 'http://localhost:3000/load-metadata' // endpoint de customiza????es dos metadados
 *   }
 * }
 * ```
 *
 * A requisi????o dos metadados ?? feita na inicializa????o do template para buscar os metadados da p??gina passando o
 * tipo do metadado esperado e a vers??o cacheada pelo browser.
 *
 * O formato esperado na resposta da requisi????o est?? especificado na interface
 * [PoPageDynamicDetailMetadata](/documentation/po-page-dynamic-detail#po-page-dynamic-detail-metadata). Por exemplo:
 *
 * ```
 *  {
 *   version: 1,
 *   title: 'Person Detail',
 *   fields: [
 *     { property: 'id', key: true, disabled: true },
 *     { property: 'status' },
 *     { property: 'name' },
 *     { property: 'nickname' },
 *     { property: 'birthdate', label: 'Birth date' },
 *     { property: 'genre' },
 *     { property: 'city' },
 *     { property: 'country' }
 *   ]
 * }
 * ```
 *
 * > Caso o endpoint dos metadados n??o seja especificado, ser?? feito uma requisi????o utilizando o `serviceApi` da seguinte forma:
 * ```
 * GET {end-point}/metadata?type=detail&version={version}
 * ```
 *
 * @example
 *
 * <example name="po-page-dynamic-detail-user" title="PO Page Dynamic Detail User">
 *  <file name="sample-po-page-dynamic-detail-user/sample-po-page-dynamic-detail-user.component.html"> </file>
 *  <file name="sample-po-page-dynamic-detail-user/sample-po-page-dynamic-detail-user.component.ts"> </file>
 * </example>
 */
@Component({
  selector: 'po-page-dynamic-detail',
  templateUrl: './po-page-dynamic-detail.component.html',
  providers: [PoPageDynamicService, PoPageDynamicDetailActionsService]
})
export class PoPageDynamicDetailComponent implements OnInit, OnDestroy {
  /** Objeto com propriedades do breadcrumb. */
  @Input('p-breadcrumb') breadcrumb?: PoBreadcrumb = { items: [] };

  /**
   * Fun????o ou servi??o que ser?? executado na inicializa????o do componente.
   *
   * A propriedade aceita os seguintes tipos:
   * - `string`: *Endpoint* usado pelo componente para requisi????o via `POST`.
   * - `function`: M??todo que ser?? executado.
   *
   * O retorno desta fun????o deve ser do tipo `PoPageDynamicDetailOptions`,
   * onde o usu??rio poder?? customizar novos campos, breadcrumb, title e actions
   *
   * Por exemplo:
   *
   * ```
   * getPageOptions(): PoPageDynamicDetailOptions {
   * return {
   *   actions:
   *     { new: 'new', edit: 'edit/:id', remove: true },
   *   fields: [
   *     { property: 'idCard', gridColumns: 6 }
   *   ]
   * };
   * }
   *
   * ```
   * Para referenciar a sua fun????o utilize a propriedade `bind`, por exemplo:
   * ```
   *  [p-load]="onLoadOptions.bind(this)"
   * ```
   */
  @Input('p-load') onLoad: string | (() => PoPageDynamicDetailOptions);

  /** T??tulo da p??gina. */
  @Input('p-title') title: string;

  /**
   * @description
   *
   * Endpoint usado pelo template para requisi????o do recurso que ser??o exibido.
   *
   * Caso a a????o `remove` estiver configurada, ser?? feito uma requisi????o de exclus??o nesse mesmo endpoint passando os campos
   * setados como `key: true`.
   *
   * > `DELETE {end-point}/{keys}`
   *
   * ```
   *  <po-page-dynamic-detail
   *    [p-actions]="{ remove: '/' }"
   *    [p-fields]="[ { property: 'id', key: true } ]"
   *    p-service="/api/po-samples/v1/people"
   *    ...>
   *  </po-page-dynamic-detail>
   * ```
   *
   * Resquisi????o disparada, onde a propriedade `id` ?? igual a 2:
   *
   * ```
   *  DELETE /api/po-samples/v1/people/2 HTTP/1.1
   *  Host: localhost:4000
   *  Connection: keep-alive
   *  Accept: application/json, text/plain
   *  ...
   * ```
   *
   * > Caso esteja usando metadados com o template, ser?? disparado uma requisi????o na inicializa????o do template para buscar
   * > os metadados da p??gina passando o tipo do metadado esperado e a vers??o cacheada pelo browser.
   * >
   * > `GET {end-point}/metadata?type=detail&version={version}`
   */
  @Input('p-service-api') serviceApi: string;

  literals;
  model: any = {};

  private subscriptions: Array<Subscription> = [];

  private _actions: PoPageDynamicDetailActions = {};
  private _autoRouter: boolean = false;
  private _duplicates: Array<any> = [];
  private _fields: Array<any> = [];
  private _keys: Array<any> = [];
  private _pageActions: Array<PoPageAction> = [];

  /**
   * @optional
   *
   * @description
   *
   * Define as a????es da p??gina de acordo com a interface `PoPageDynamicDetailActions`.
   */
  @Input('p-actions') set actions(value: PoPageDynamicDetailActions) {
    this._actions = this.isObject(value) ? value : {};

    this._pageActions = this.getPageActions(this._actions);
  }

  get actions() {
    return { ...this._actions };
  }

  /**
   * @todo Validar rotas na m??o pois se existir uma rota '**' o catch do navigation n??o funciona.
   *
   * @optional
   *
   * @description
   *
   * Cria automaticamente as rotas de edi????o (novo/duplicate) e detalhes caso as a????es
   * estejam definidas nas a????es.
   *
   * > Para o correto funcionamento n??o pode haver nenhum rota coringa (`**`) especificada.
   *
   * @default false
   */
  @Input('p-auto-router') set autoRouter(value: boolean) {
    this._autoRouter = convertToBoolean(value);
  }

  get autoRouter(): boolean {
    return this._autoRouter;
  }

  /** Lista dos campos exibidos na p??gina. */
  @Input('p-fields') set fields(value: Array<PoPageDynamicDetailField>) {
    this._fields = Array.isArray(value) ? [...value] : [];

    this._keys = this.getKeysByFields(this.fields);
    this._duplicates = this.getDuplicatesByFields(this.fields);
  }

  get fields(): Array<PoPageDynamicDetailField> {
    return this._fields;
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private poNotification: PoNotificationService,
    private poDialogService: PoDialogService,
    private poPageDynamicService: PoPageDynamicService,
    private poPageDynamicDetailActionsService: PoPageDynamicDetailActionsService,
    private poPageCustomizationService: PoPageCustomizationService,
    languageService: PoLanguageService
  ) {
    const language = languageService.getShortLanguage();

    this.literals = {
      ...poPageDynamicDetailLiteralsDefault[poLocaleDefault],
      ...poPageDynamicDetailLiteralsDefault[language]
    };
  }

  ngOnInit(): void {
    this.loadDataFromAPI();
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.forEach(subscription => {
        subscription.unsubscribe();
      });
    }
  }

  get duplicates() {
    return [...this._duplicates];
  }

  get keys() {
    return [...this._keys];
  }

  get pageActions() {
    return [...this._pageActions];
  }

  private remove(
    actionRemove: PoPageDynamicDetailActions['remove'],
    actionBeforeRemove?: PoPageDynamicDetailActions['beforeRemove']
  ) {
    const uniqueKey = this.formatUniqueKey(this.model);

    this.subscriptions.push(
      this.poPageDynamicDetailActionsService
        .beforeRemove(actionBeforeRemove, uniqueKey, { ...this.model })
        .pipe(
          switchMap((beforeRemoveResult: PoPageDynamicDetailBeforeRemove) => {
            const newRemoveAction = beforeRemoveResult?.newUrl ?? actionRemove;
            const allowAction = beforeRemoveResult?.allowAction ?? true;

            if (!allowAction) {
              return of({});
            }

            if (typeof newRemoveAction === 'string') {
              return this.executeRemove(newRemoveAction, uniqueKey);
            } else {
              newRemoveAction(uniqueKey, { ...this.model });
              return EMPTY;
            }
          })
        )
        .subscribe()
    );
  }

  private confirmRemove(
    actionRemove: PoPageDynamicDetailActions['remove'],
    actionBeforeRemove: PoPageDynamicDetailActions['beforeRemove']
  ) {
    const confirmOptions: PoDialogConfirmOptions = {
      title: this.literals.confirmRemoveTitle,
      message: this.literals.confirmRemoveMessage,
      confirm: this.remove.bind(this, actionRemove, actionBeforeRemove)
    };

    this.poDialogService.confirm(confirmOptions);
  }

  private executeRemove(path, uniqueKey: any) {
    return this.poPageDynamicService.deleteResource(uniqueKey).pipe(
      map(() => {
        this.poNotification.success(this.literals.removeNotificationSuccess);
        this.navigateTo({ path: path });
      })
    );
  }

  private formatUniqueKey(item) {
    const keys = mapObjectByProperties(item, this.keys);

    return valuesFromObject(keys).join('|');
  }

  private goBack(actionBack: PoPageDynamicDetailActions['back']) {
    this.subscriptions.push(
      this.poPageDynamicDetailActionsService
        .beforeBack(this.actions.beforeBack)
        .subscribe((beforeBackResult: PoPageDynamicDetailBeforeBack) =>
          this.executeBackAction(actionBack, beforeBackResult?.allowAction, beforeBackResult?.newUrl)
        )
    );
  }

  private executeBackAction(actionBack: PoPageDynamicDetailActions['back'], allowAction?, newUrl?: string) {
    const isAllowedAction = typeof allowAction === 'boolean' ? allowAction : true;

    if (isAllowedAction) {
      if (actionBack === undefined || typeof actionBack === 'boolean') {
        return window.history.back();
      }

      if (typeof actionBack === 'string' || newUrl) {
        return this.router.navigate([newUrl || actionBack]);
      }

      return actionBack();
    }
  }

  private loadData(id) {
    return this.poPageDynamicService.getResource(id).pipe(
      tap(response => {
        if (!response) {
          this.setUndefinedToModelAndActions();
        } else {
          this.model = response;
        }
      }),
      catchError(error => {
        this.setUndefinedToModelAndActions();
        return throwError(error);
      })
    );
  }

  private setUndefinedToModelAndActions() {
    this.model = undefined;
    this.actions = undefined;
  }

  private getMetadata(
    serviceApiFromRoute: string,
    onLoad: UrlOrPoCustomizationFunction
  ): Observable<PoPageDynamicDetailMetaData> {
    if (serviceApiFromRoute) {
      return this.poPageDynamicService.getMetadata<PoPageDynamicDetailMetaData>('detail').pipe(
        tap(response => {
          this.autoRouter = response.autoRouter || this.autoRouter;
          this.actions = response.actions || this.actions;
          this.breadcrumb = response.breadcrumb || this.breadcrumb;
          this.fields = response.fields || this.fields;
          this.title = response.title || this.title;
        }),
        switchMap(() => this.loadOptionsOnInitialize(onLoad))
      );
    }

    return this.loadOptionsOnInitialize(onLoad);
  }

  // @todo Validar rotas na m??o pois se existir uma rota '**' o catch do navigation n??o funciona.
  private navigateTo(
    route: { path: string; component?; url?: string; params?: any },
    forceStopAutoRouter: boolean = false
  ) {
    this.router.navigate([route.url || route.path], { queryParams: route.params }).catch(() => {
      if (forceStopAutoRouter || !this.autoRouter) {
        return;
      }

      this.router.config.unshift(<Route>{
        path: route.path,
        component: route.component,
        data: { serviceApi: this.serviceApi, autoRouter: true }
      });

      this.navigateTo(route, true);
    });
  }

  private openEdit(action: PoPageDynamicDetailActions['edit']) {
    const id = this.formatUniqueKey(this.model);

    this.subscriptions.push(
      this.poPageDynamicDetailActionsService
        .beforeEdit(this.actions.beforeEdit, id, this.model)
        .pipe(
          switchMap((beforeEditResult: PoPageDynamicDetailBeforeEdit) =>
            this.executeEditAction(action, beforeEditResult, id)
          )
        )
        .subscribe()
    );
  }

  private executeEditAction(
    action: PoPageDynamicDetailActions['edit'],
    beforeEditResult: PoPageDynamicDetailBeforeEdit,
    id: any
  ) {
    const newEditAction = beforeEditResult?.newUrl ?? action;
    const allowAction = beforeEditResult?.allowAction ?? true;

    if (!allowAction) {
      return of({});
    }

    if (typeof newEditAction === 'string') {
      this.openEditUrl(newEditAction);
    } else {
      newEditAction(id, { ...this.model });
    }

    return EMPTY;
  }

  private openEditUrl(path: string) {
    const url = this.resolveUrl(this.model, path);
    this.navigateTo({ path, url });
  }

  private resolveUrl(item: any, path: string) {
    const uniqueKey = this.formatUniqueKey(item);

    return path.replace(/:id/g, uniqueKey);
  }

  private getPageActions(actions: PoPageDynamicDetailActions = {}): Array<PoPageAction> {
    const pageActions = [];

    if (actions.edit) {
      pageActions.push({ label: this.literals.pageActionEdit, action: this.openEdit.bind(this, actions.edit) });
    }

    if (actions.remove) {
      pageActions.push({
        label: this.literals.pageActionRemove,
        action: this.confirmRemove.bind(this, actions.remove, this.actions.beforeRemove)
      });
    }

    if (actions.back === undefined || actions.back) {
      pageActions.push({ label: this.literals.pageActionBack, action: this.goBack.bind(this, actions.back) });
    }

    return pageActions;
  }

  private getKeysByFields(fields: Array<any> = []) {
    return fields.filter(field => field.key === true).map(field => field.property);
  }

  private getDuplicatesByFields(fields: Array<any> = []) {
    return fields.filter(field => field.duplicate === true).map(field => field.property);
  }

  private isObject(value: any): boolean {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  private loadDataFromAPI() {
    const { serviceApi: serviceApiFromRoute, serviceMetadataApi, serviceLoadApi } = this.activatedRoute.snapshot.data;
    const { id } = this.activatedRoute.snapshot.params;

    const onLoad = serviceLoadApi || this.onLoad;
    this.serviceApi = serviceApiFromRoute || this.serviceApi;

    this.poPageDynamicService.configServiceApi({ endpoint: this.serviceApi, metadata: serviceMetadataApi });

    const metadata$ = this.getMetadata(serviceApiFromRoute, onLoad);
    const data$ = this.loadData(id);

    this.subscriptions.push(concat(metadata$, data$).subscribe());
  }

  private loadOptionsOnInitialize(onLoad: UrlOrPoCustomizationFunction) {
    if (onLoad) {
      return this.getPoDynamicPageOptions(onLoad).pipe(
        tap(responsePoOption =>
          this.poPageCustomizationService.changeOriginalOptionsToNewOptions(this, responsePoOption)
        )
      );
    }

    return EMPTY;
  }

  private getPoDynamicPageOptions(onLoad: UrlOrPoCustomizationFunction): Observable<PoPageDynamicDetailOptions> {
    const originalOption: PoPageDynamicDetailOptions = {
      fields: this.fields,
      actions: this.actions,
      breadcrumb: this.breadcrumb,
      title: this.title
    };

    const pageOptionSchema: PoPageDynamicOptionsSchema<PoPageDynamicDetailOptions> = {
      schema: [
        {
          nameProp: 'fields',
          merge: true,
          keyForMerge: 'property'
        },
        {
          nameProp: 'actions',
          merge: true
        },
        {
          nameProp: 'breadcrumb'
        },
        {
          nameProp: 'title'
        }
      ]
    };

    return this.poPageCustomizationService.getCustomOptions(onLoad, originalOption, pageOptionSchema);
  }
}
