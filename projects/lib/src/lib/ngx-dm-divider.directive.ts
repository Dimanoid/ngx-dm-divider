import { Directive, ElementRef, EventEmitter, Input, OnChanges, Output, Renderer2, SimpleChanges } from '@angular/core';
import { InputBoolean, InputNumber } from './coercions';

export interface Point {
    x: number;
    y: number;
}

@Directive({
    selector: '[ngx-dm-divider]',
    exportAs: 'dmDivaider',
})
export class DmDividerDirective implements OnChanges {
    @Input('dmDividerDirection') direction: 'horizontal' | 'vertical' = 'horizontal';
    @Input('dmDividerInvert') @InputBoolean() invert: boolean | string = false;
    @Input('dmDividerEnabled') @InputBoolean() enabled: boolean | string = true;
    @Input('dmDividerMin') @InputNumber() min: number | string = 0;
    @Input('dmDividerMax') @InputNumber() max?: number | string;
    @Input('dmDividerSize') @InputNumber() size?: number | string;
    @Output('dmDividerSizeChange') sizeChange: EventEmitter<number> = new EventEmitter();
    @Output('dmDividerMoving') movingChange: EventEmitter<boolean> = new EventEmitter();

    moving: boolean = false;
    start?: Point;
    startSize?: number;

    constructor(private _elemRef: ElementRef, private _r2: Renderer2) {
        this._elemRef.nativeElement.onmousedown = (event: MouseEvent) => {
            if (!this.enabled) {
                return;
            }
            // tslint:disable-next-line: deprecation
            event = event || window.event as MouseEvent;
            event.stopPropagation();
            event.preventDefault();
            if (event.pageX) {
                this.start = { x: event.pageX, y: event.pageY };
            }
            else if (event.clientX) {
                this.start = { x: event.clientX, y: event.clientY };
            }
            if (this.start) {
                this.dividerDragStart();

                document.body.onmousemove = (e: MouseEvent) => {
                    // tslint:disable-next-line: deprecation
                    e = e || window.event as MouseEvent;
                    e.stopPropagation();
                    e.preventDefault();
                    let endX = 0;
                    let endY = 0;
                    if (e.pageX) {
                        endX = e.pageX;
                        endY = e.pageY;
                    }
                    else if (e.clientX) {
                        endX = e.clientX;
                        endY = e.clientX;
                    }
                    if (this.start) {
                        this.dividerMove({ x: endX - this.start.x, y: endY - this.start.y });
                    }
                };

                document.body.onmouseup = (e: MouseEvent) => {
                    document.body.onmousemove = document.body.onmouseup = null;
                    // tslint:disable-next-line: deprecation
                    e = e || window.event as MouseEvent;
                    e.stopPropagation();
                    e.preventDefault();
                    let endX = 0;
                    let endY = 0;
                    if (e.pageX) {
                        endX = e.pageX;
                        endY = e.pageY;
                    }
                    else if (e.clientX) {
                        endX = e.clientX;
                        endY = e.clientX;
                    }
                    if (this.start) {
                        this.dividerDragEnd({ x: endX - this.start.x, y: endY - this.start.y });
                    }
                    this.start = undefined;
                };
            }
        };
        this._r2.addClass(this._elemRef.nativeElement, 'ngx-dm-divider');
    }

    ngOnChanges(_changes: SimpleChanges): void {
        const e = this._elemRef.nativeElement;
        if (this.direction == 'horizontal') {
            this._r2.removeClass(e, 'ngx-dm-divider-vert');
            this._r2.addClass(e, 'ngx-dm-divider-hor');
        }
        else {
            this._r2.removeClass(e, 'ngx-dm-divider-hor');
            this._r2.addClass(e, 'ngx-dm-divider-vert');
        }
        this.startSize = +this.size!;
        this.__dividerCalc({ x: 0, y: 0 });
    }

    dividerDragStart() {
        this.moving = true;
        this._r2.addClass(this._elemRef.nativeElement, 'ngx-dm-divider-moving');
        this.movingChange.emit(this.moving);
        this.startSize = +this.size!;
    }

    dividerDragEnd(p: Point) {
        this.moving = false;
        this._r2.removeClass(this._elemRef.nativeElement, 'ngx-dm-divider-moving');
        this.movingChange.emit(this.moving);
        this.__dividerCalc(p);
    }

    dividerMove(p: Point) {
        this.__dividerCalc(p);
    }

    private __dividerCalc(p: Point) {
        const axis = this.direction == 'horizontal' ? 'x' : 'y';
        const m = this.invert ? -1 : 1;
        let size = +this.startSize! + (m * p[axis]);
        if (size < this.min) {
            size = +this.min;
        }
        if (this.max && size > this.max) {
            size = +this.max;
        }
        this.size = size;
        this.sizeChange.emit(this.size);
    }

}
