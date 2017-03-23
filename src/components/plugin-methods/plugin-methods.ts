import {Component, EventEmitter, Input, NgZone, Output} from '@angular/core';
import {PluginResultComponent} from "../plugin-result/plugin-result";
import {ModalController} from "ionic-angular";
import {PluginParamsPage} from "../../pages/plugin-params/plugin-params";

/*
 Generated class for the PluginMethods component.

 See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 for more info on Angular 2 Components.
 */
@Component({
  selector: 'plugin-methods',
  templateUrl: 'plugin-methods.html'
})
export class PluginMethodsComponent {

  _plugin: any;

  @Input()
  set plugin(val: any) {
    this._plugin = val;
    this.processPlugin();
  }

  @Input()
  pluginResult: PluginResultComponent;

  @Output()
  onResult = new EventEmitter<any>();

  @Output()
  onError = new EventEmitter<any>();

  private success = val => {
    this.ngZone.run(() => {
      if (this.pluginResult) {
        this.pluginResult.result = val;
      } else {
        this.onResult.emit(val);
      }
    });
  };

  private error = val => {
    this.ngZone.run(() => {
      if (this.pluginResult) {
        this.pluginResult.error = val;
      } else {
        this.onError.emit(val);
      }
    });
  };


  properties: any[] = [];
  methods: any[] = [];

  constructor(private ngZone: NgZone, private modalCtrl: ModalController){}

  private processPlugin() {
    if (!this._plugin) return;

    for (let member in this._plugin) {
      const isFunction = typeof this._plugin[member] == 'function';

      const button = {
        text: member,
        handler: (withParams: boolean = false) => {

          const method = this._plugin[member];

          if (isFunction) {

            const getResult = (args: any[] = []) => {
              const result = method.apply(this._plugin, args);

              if (result.then) {
                result.then(this.success.bind(this)).catch(this.error.bind(this));
              } else if (result.subscribe) {
                result.subscribe({
                  next: this.success.bind(this),
                  error: this.error.bind(this),
                  completed: this.success.bind(this)
                });
              } else {
                this.success(result);
              }
            };

            if (withParams) {
              this.getParams().then(params => getResult(params));
            } else {
              getResult();
            }

          } else {
            this.success(method);
          }

        }
      };

      isFunction ? this.methods.push(button) : this.properties.push(button);

    }
  }

  private getParams(): Promise<any> {
    return new Promise<any>((resolve) => {
      const modal = this.modalCtrl.create(PluginParamsPage);
      modal.present();
      modal.onDidDismiss(resolve);
    });
  }

}
