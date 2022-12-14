import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  IterableDiffers,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import { AbstractControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';

import {
  removeDuplicatedOptions,
  removeDuplicatedOptionsWithFieldValue,
  removeUndefinedAndNullOptions,
  removeUndefinedAndNullOptionsWithFieldValue,
  uuid,
  validValue
} from '../../../utils/util';

import { InputBoolean } from '../../../decorators';
import { PoFieldValidateModel } from '../po-field-validate.model';
import { PoSelectOption } from './po-select-option.interface';

const PO_SELECT_FIELD_LABEL_DEFAULT = 'label';
const PO_SELECT_FIELD_VALUE_DEFAULT = 'value';

/**
 * @docsExtends PoFieldValidateModel
 *
 * @example
 *
 * <example name="po-select-basic" title="PO Select Basic">
 *   <file name="sample-po-select-basic/sample-po-select-basic.component.html"> </file>
 *   <file name="sample-po-select-basic/sample-po-select-basic.component.ts"> </file>
 * </example>
 *
 * <example name="po-select-labs" title="PO Select Labs">
 *   <file name="sample-po-select-labs/sample-po-select-labs.component.html"> </file>
 *   <file name="sample-po-select-labs/sample-po-select-labs.component.ts"> </file>
 * </example>
 *
 * <example name="po-select-customer-registration" title="PO Select - Customer registration">
 *   <file name="sample-po-select-customer-registration/sample-po-select-customer-registration.component.html"> </file>
 *   <file name="sample-po-select-customer-registration/sample-po-select-customer-registration.component.ts"> </file>
 *   <file name="sample-po-select-customer-registration/sample-po-select-customer-registration.service.ts"> </file>
 *   <file name='sample-po-select-customer-registration/sample-po-select-customer-registration.component.e2e-spec.ts'> </file>
 *   <file name='sample-po-select-customer-registration/sample-po-select-customer-registration.component.po.ts'> </file>
 * </example>
 *
 * <example name="po-select-companies" title="PO Select Companies">
 *   <file name="sample-po-select-companies/sample-po-select-companies.component.html"> </file>
 *   <file name="sample-po-select-companies/sample-po-select-companies.component.ts"> </file>
 * </example>
 *
 * @description
 *
 * O componente po-select exibe uma lista de valores e permite que o usu??rio selecione um desses valores.
 * Os valores listados podem ser fixos ou din??micos de acordo com a necessidade do desenvolvedor, dando mais flexibilidade ao componente.
 * O po-select n??o permite que o usu??rio informe um valor diferente dos valores listados, isso garante a consist??ncia da informa????o.
 * O po-select n??o permite que sejam passados valores duplicados, undefined e null para as op????es, excluindo-os da lista.
 *
 * > Ao passar um valor para o _model_ que n??o est?? na lista de op????es, o mesmo ser?? definido como `undefined`.
 *
 * Tamb??m existe a possibilidade de utilizar um _template_ para a exibi????o dos itens da lista,
 * veja mais em **[p-combo-option-template](/documentation/po-combo-option-template)**.
 *
 * > Obs: o template **[p-select-option-template](/documentation/po-select-option-template)** ser?? depreciado na vers??o 14.x.x.
 */
@Component({
  selector: 'po-select',
  templateUrl: './po-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PoSelectComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PoSelectComponent),
      multi: true
    }
  ]
})
export class PoSelectComponent extends PoFieldValidateModel<any> implements DoCheck {
  @ViewChild('select', { read: ElementRef, static: true }) selectElement: ElementRef;

  /**
   * @optional
   *
   * @description
   *
   * Fun????o para atualizar o ngModel do componente, necess??rio quando n??o for utilizado dentro da tag form.
   *
   * Na vers??o 12.2.0 do Angular a verifica????o `strictTemplates` vem true como default. Portanto, para utilizar
   * two-way binding no componente deve se utilizar da seguinte forma:
   *
   * ```
   * <po-select ... [ngModel]="selectModel" (ngModelChange)="selectModel = $event"> </po-select>
   * ```
   */
  @Output('ngModelChange') ngModelChange: EventEmitter<any> = new EventEmitter<any>();

  /**
   * @optional
   *
   * @description
   *
   * Indica que o campo ser?? somente para leitura.
   *
   * @default `false`
   */
  @Input('p-readonly') @InputBoolean() readonly: boolean = false;

  /** Mensagem que aparecer?? enquanto nenhuma op????o estiver selecionada. */
  @Input('p-placeholder') placeholder?: string;

  displayValue;
  id = `po-select[${uuid()}]`;
  modelValue: any;
  selectedValue: any;
  protected onModelTouched: any;

  private differ: any;
  private _fieldLabel?: string = PO_SELECT_FIELD_LABEL_DEFAULT;
  private _fieldValue?: string = PO_SELECT_FIELD_VALUE_DEFAULT;
  private _options: Array<PoSelectOption> | Array<any>;

  /**
   * Nesta propriedade deve ser definido uma cole????o de objetos que implementam a interface `PoSelectOption`.
   *
   * Caso esta lista estiver vazia, o model ser?? `undefined`.
   *
   * > Essa propriedade ?? imut??vel, ou seja, sempre que quiser atualizar a lista de op????es dispon??veis
   * atualize a refer??ncia do objeto:
   *
   * ```
   * // atualiza a refer??ncia do objeto garantindo a atualiza????o do template
   * this.options = [...this.options, { value: 'x', label: 'Nova op????o' }];
   *
   * // evite, pois n??o atualiza a refer??ncia do objeto podendo gerar atrasos na atualiza????o do template
   * this.options.push({ value: 'x', label: 'Nova op????o' });
   * ```
   */
  @Input('p-options') set options(options: Array<any>) {
    if (this.fieldLabel && this.fieldValue) {
      options.map(option => {
        option.label = option[this.fieldLabel];
        option.value = option[this.fieldValue];
      });
    }

    this.validateOptions([...options]);
    this.onUpdateOptions();
    this._options = [...options];
  }

  get options() {
    return this._options;
  }

  /**
   * @optional
   *
   * @description
   * Deve ser informado o nome da propriedade do objeto que ser?? utilizado para a convers??o dos itens apresentados na lista do componente
   * (`p-options`), esta propriedade ser?? respons??vel pelo texto de apresenta????o de cada item da lista.
   *
   * @default `label`
   */
  @Input('p-field-label') set fieldLabel(value: string) {
    this._fieldLabel = value || PO_SELECT_FIELD_LABEL_DEFAULT;
    if (this.options && this.options.length > 0) {
      this.options = [...this.options];
    }
  }

  get fieldLabel() {
    return this._fieldLabel;
  }

  /**
   * @optional
   *
   * @description
   * Deve ser informado o nome da propriedade do objeto que ser?? utilizado para a convers??o dos itens apresentados na lista do componente
   * (`p-options`), esta propriedade ser?? respons??vel pelo valor de cada item da lista.
   *
   * @default `value`
   */
  @Input('p-field-value') set fieldValue(value: string) {
    this._fieldValue = value || PO_SELECT_FIELD_VALUE_DEFAULT;
    if (this.options && this.options.length > 0) {
      this.options = [...this.options];
    }
  }

  get fieldValue() {
    return this._fieldValue;
  }

  /* istanbul ignore next */
  constructor(private changeDetector: ChangeDetectorRef, differs: IterableDiffers, public renderer: Renderer2) {
    super();
    this.differ = differs.find([]).create(null);
  }

  ngDoCheck() {
    const change = this.differ.diff(this.options);

    if (change) {
      this.validateOptions(this.options);
    }
  }

  /**
   * Fun????o que atribui foco ao componente.
   *
   * Para utiliz??-la ?? necess??rio ter a inst??ncia do componente no DOM, podendo ser utilizado o ViewChild da seguinte forma:
   *
   * ```
   * import { PoSelectComponent } from '@po-ui/ng-components';
   *
   * ...
   *
   * @ViewChild(PoSelectComponent, { static: true }) select: PoSelectComponent;
   *
   * focusSelect() {
   *   this.select.focus();
   * }
   * ```
   */
  focus(): void {
    if (!this.disabled) {
      this.selectElement.nativeElement.focus();
    }
  }

  onBlur() {
    this.onModelTouched?.();
  }

  // Altera o valor ao selecionar um item.
  onSelectChange(value: any) {
    this.onModelTouched?.();
    if (value && this.options && this.options.length) {
      const optionFound: any = this.findOptionValue(value);

      if (optionFound) {
        this.updateValues(optionFound);
      }
    }
  }

  onUpdateOptions() {
    if (this.modelValue) {
      this.onSelectChange(this.modelValue);
    }
  }

  // Atualiza valores
  updateValues(option: any): void {
    if (this.selectedValue !== option[this.fieldValue]) {
      this.selectedValue = option[this.fieldValue];
      this.selectElement.nativeElement.value = option[this.fieldValue];
      this.updateModel(option[this.fieldValue]);
      this.displayValue = option[this.fieldLabel];
      this.emitChange(option[this.fieldValue]);
    }
  }

  // Recebe as altera????es do model
  onWriteValue(value: any) {
    const optionFound: any = this.findOptionValue(value);

    if (optionFound) {
      this.selectElement.nativeElement.value = optionFound.value;
      this.selectedValue = optionFound[this.fieldValue];
      this.displayValue = optionFound[this.fieldLabel];
    } else if (validValue(this.selectedValue)) {
      this.selectElement.nativeElement.value = undefined;
      this.updateModel(undefined);
      this.selectedValue = undefined;
      this.displayValue = undefined;
    }

    this.modelValue = value;
    this.changeDetector.detectChanges();
  }

  extraValidation(c: AbstractControl): { [key: string]: any } {
    return null;
  }

  registerOnTouched(fn: any): void {
    this.onModelTouched = fn;
  }

  private isEqual(value: any, inputValue: any): boolean {
    if ((value || value === 0) && inputValue) {
      return value.toString() === inputValue.toString();
    }

    if ((value === null && inputValue !== null) || (value === undefined && inputValue !== undefined)) {
      value = `${value}`; // Transformando em string
    }

    return value === inputValue;
  }

  private findOptionValue(value: any) {
    return this.options.find(option => this.isEqual(option.value, value));
  }

  private validateOptions(options: Array<any>) {
    removeDuplicatedOptions(options);
    removeUndefinedAndNullOptions(options);
    removeDuplicatedOptionsWithFieldValue(options, this.fieldValue);
    removeUndefinedAndNullOptionsWithFieldValue(options, this.fieldValue);
  }
}
