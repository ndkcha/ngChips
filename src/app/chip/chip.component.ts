import { Component, forwardRef, Input, Output, EventEmitter, TemplateRef } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";

@Component({
    selector: 'cb-chip',
    templateUrl: './chip.component.html',
    styleUrls: ['./chip.component.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ChipComponent),
        multi: true
    }]
})
export class ChipComponent implements ControlValueAccessor {
    onChange = (_: any[]) => {};
    @Input() _chips: any[] = [];
    @Output() onQuery: EventEmitter<string> = new EventEmitter();
    @Input() options: any[];
    @Input() threshold: number = 2;
    @Input() template: TemplateRef<any>;
    @Output() onAdd: EventEmitter<any> = new EventEmitter();
    @Output() onRemove: EventEmitter<any> = new EventEmitter();
    private timeout = undefined;

    get chips() {
        return this._chips;
    }

    set chips(val) {
        this._chips = val;
        this.onChange(this._chips);
    }

    writeValue(value: any[]) {
        if (value !== undefined)
            this.chips = value;
    }

    registerOnChange(fn): void {
        this.onChange = fn;
    }

    registerOnTouched() { };

    deleteChip(index: number): void {
        this.onRemove.emit(this.chips[index]);
        this.chips.splice(index, 1);
    }

    onQueryTriggered(query: string): void {
        this.options = [];
        if (this.timeout) {
            window.clearTimeout(this.timeout);
            this.timeout = undefined;
        }
        this.timeout = window.setTimeout(() => {
            if (query.length > this.threshold) {
                this.options = [];
                this.onQuery.emit(query);
            }
        }, 1000);
    }

    addItem(index: number, box: HTMLInputElement): void {
        box.value = null;
        let option: any = this.options[index];
        this.chips.push(option);
        this.onAdd.emit(option);
        this.options = [];
    }
}