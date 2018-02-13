import { Component, forwardRef, Input, Output, EventEmitter, TemplateRef, KeyValueDiffers, OnInit, KeyValueDiffer, KeyValueChanges, DoCheck } from "@angular/core";
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
export class ChipComponent implements ControlValueAccessor, OnInit, DoCheck {
    onChange = (_: any[]) => {};
    @Input() _chips: any[] = [];
    @Output() onQuery: EventEmitter<string> = new EventEmitter();
    @Input() options: any[];
    @Input() threshold: number = 2;
    @Input() template: TemplateRef<any>;
    @Output() onAdd: EventEmitter<any> = new EventEmitter();
    @Output() onRemove: EventEmitter<any> = new EventEmitter();
    private optionsDiffer: KeyValueDiffer<any, any>;
    private timeout = undefined;

    constructor(private differs: KeyValueDiffers) { }

    ngOnInit() {
        this.optionsDiffer = this.differs.find(this.options).create();
    }

    private optionChanged(changes: KeyValueChanges<any, any>) {
        let chips = this.chips;
        this.options = this.options.filter(filterOptions);

        function filterOptions(obj: any) {
            for (let i = 0; i < chips.length; i++) {
                if (JSON.stringify(chips[i]) == JSON.stringify(obj))
                    return false;
            }
            return true;
        }
    }

    ngDoCheck() {
        const optChanges = this.optionsDiffer.diff(this.options);
        if (optChanges)
            this.optionChanged(optChanges);
    }

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
            if (query.length > this.threshold)
                this.onQuery.emit(query);
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