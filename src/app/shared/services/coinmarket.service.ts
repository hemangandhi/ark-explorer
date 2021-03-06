import { Injectable } from '@angular/core';
import { Http, Response, RequestOptionsArgs } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Chart } from 'angular-highcharts';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/Rx';

import { ThemeService } from './theme.service';


@Injectable()
export class CoinmarketService {
  public chart: any;
  public isDarkTheme: boolean;

  private chartSource = new Subject<any>();

  chartBuilt$ = this.chartSource.asObservable();

  chartBuild(value: any) {
    this.chartSource.next(value);
  }

  constructor(private http: Http, private _themeService: ThemeService) {
    this._themeService.isDarkThemeChange$.subscribe((data) => {
      this.isDarkTheme = data;
      if (this.chart) {
        let options = this.chart['options'];
        options = this.toDarkMode(options);

        this.chart = new Chart(options);
        this.chartBuild(this.chart);
      }
    });
  }

  public toDarkMode(options: any) {
    options['chart']['backgroundColor'] = this.isDarkTheme ? '#1d1d1d' : '#fff';
    options['title']['style']['color'] = this.isDarkTheme ? '#fff' : '#000';
    options['subtitle']['style']['color'] = this.isDarkTheme ? '#aaa' : '#3C4144';
    options['yAxis']['gridLineColor'] = this.isDarkTheme ? '#333' : '#e6e6e6';
    options['xAxis']['lineColor'] = this.isDarkTheme ? '#666' : '#ccc';
    options['xAxis']['tickColor'] = this.isDarkTheme ? '#666' : '#ccc';
    options['xAxis']['labels']['style']['color'] = this.isDarkTheme ? '#aaa' : '#3C4144';
    options['yAxis']['labels']['style']['color'] = this.isDarkTheme ? '#aaa' : '#3C4144';
    options['yAxis']['title']['style']['color'] = this.isDarkTheme ? '#aaa' : '#3C4144';

    return options;
  }

  public build(param: string) {
    let categories = [];
    let currencyData = [];
    let chartSubtitle = '';
    this.getData(param).subscribe(
      res => {
        categories = this.getTimeLine(res.Data, param);
        currencyData = this.getValues(res.Data);
        chartSubtitle = this.getSubtitle(currencyData);

        let options = {
          chart: {
            type: 'line'
          },
          xAxis: {
            // type: 'datetime',
            // min: categories[0],
            // max: categories[categories.length-1]
            categories: categories,
            lineColor: '#ccc',
            tickColor: '#ccc',
            labels: {
              style: {
                color: '#3C4144'
              }
            }
          } as any,
          yAxis: {
            gridLineWidth: 1,
            gridLineColor: '#dedede',
            title: {
              text: 'USD',
              style: {
                color: '#3C4144'
              }
            },
            labels: {
              style: {
                color: '#3C4144'
              }
            }
          },
          title: {
            text: 'ARK Line Chart',
            align: 'left',
            style: { "color": "#000", "font-size": "24px", "font-weight": "700", "line-height": "32px", "font-family": "'Comfortaa-Regular'" },
            x: 25
          },
          subtitle: {
            text: chartSubtitle,
            align: 'left',
            style: { "font-family": "Avenir", "font-size": "16px", "color": "#3C4144" },
            x: 25
          },
          credits: {
            enabled: false
          },
          legend: {
            enabled: false
          },
          series: [{
            name: 'ARK/USD',
            data: currencyData,
            color: '#f0373c',
            animation: {
              duration: 350
            }
          }]
        };
        options = this.toDarkMode(options);

        this.chart = new Chart(options);

        this.chartBuild(this.chart);
      },
      error => {
        this.chart = null;
      }
    );
  }

  public getData(param: string) {
    let date = Math.round(new Date().getTime() / 1000);
    switch (param) {
      case 'day': {
        return this.http.get(`https://min-api.cryptocompare.com/data/histohour?fsym=ARK&tsym=USD&toTs=${date}&limit=24`)
          .map((res: Response) => { return res.json(); })
          .catch((error: any) => {
            return Observable.throw(error.json());
          });
      }
      case 'week': {
        return this.http.get(`https://min-api.cryptocompare.com/data/histohour?fsym=ARK&tsym=USD&toTs=${date}&limit=168`)
          .map((res: Response) => { return res.json(); })
          .catch((error: any) => {
            return Observable.throw(error.json());
          });
      }
      case 'month': {
        return this.http.get(`https://min-api.cryptocompare.com/data/histohour?fsym=ARK&tsym=USD&toTs=${date}&limit=720`)
          .map((res: Response) => { return res.json(); })
          .catch((error: any) => {
            return Observable.throw(error.json());
          });
      }
      case 'quarter': {
        return this.http.get(`https://min-api.cryptocompare.com/data/histohour?fsym=ARK&tsym=USD&toTs=${date}&limit=2000`)
          .map((res: Response) => { return res.json(); })
          .catch((error: any) => {
            return Observable.throw(error.json());
          });
      }
      case 'year':
      case 'all': {
        return this.http.get(`https://min-api.cryptocompare.com/data/histoday?fsym=ARK&tsym=USD&toTs=${date}&limit=365`)
          .map((res: Response) => { return res.json(); })
          .catch((error: any) => {
            return Observable.throw(error.json());
          });
      }
      default: {
        break;
      }
    }
  }

  public getTimeLine(data: any, param: string) {
    let timeArray = [];
    let format = this._defineFormat(param);
    // data.forEach(element => {
    //   timeArray.push(new Date(element.time * 1000));
    // });
    data.forEach((element, index) => {
      let date = this._formatDate(new Date(element.time * 1000), format);
      if ((index === 0) || (index > 0 && timeArray[index - 1] != date)) {
        timeArray.push(date);
      } else {
        timeArray.push('');
      }
    });
    return timeArray;
  }

  public getValues(data: any) {
    let values = [];
    data.forEach(element => {
      let avg = Math.round(((element.high + element.low) / 2) * Math.pow(10, 8)) / Math.pow(10, 8);
      values.push(avg);
    });
    return values;
  }

  public getSubtitle(data: any) {
    let current = data[data.length - 1];
    let prev = data[data.length - 2];
    let difference = Math.round((current - prev) * Math.pow(10, 8)) / Math.pow(10, 8);
    let percent = Math.round(((difference / prev) * 100) * 100) / 100;
    let sign = difference > 0 ? '+' : '';
    return '1h change: ' + sign + difference.toString() + '$ (' + sign + percent + '%)';
  }

  private _defineFormat(param: string) {
    switch (param) {
      case 'day': {
        return 'HH:mm';
      }
      case 'week':
      case 'month':
      case 'quarter': {
        return 'dd.MM';
      }
      case 'year':
      case 'all': {
        return 'MM.yyyy';
      }
    }
  }

  private _formatDate(time, format) {
    var t = new Date(time);
    var tf = function (i) { return (i < 10 ? '0' : '') + i };
    return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function (a) {
      switch (a) {
        case 'yyyy': return tf(t.getFullYear());
        case 'MM': return tf(t.getMonth() + 1);
        case 'mm': return tf(t.getMinutes());
        case 'dd': return tf(t.getDate());
        case 'HH': return tf(t.getHours());
        case 'ss': return tf(t.getSeconds());
        default: return 0;
      }
    })

  }

}
