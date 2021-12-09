import pandas as pd
import numpy as np


class DataManager:
    def __init__(self, file_path):
        self.data_df = pd.read_csv(
            file_path,
            parse_dates=['Date'],
            infer_datetime_format=True
        )
        self.data_df = self.data_df.dropna()

    def get_filter_mask(self, options):
        mask = pd.Series(True, index=self.data_df.index)
        if 'Self-defined ethnicity' in options['filter']:
            for feature in options['filter']['Self-defined ethnicity']:
                mask = (mask & self.data_df[feature] == 1)
            del options['filter']['Self-defined ethnicity']
        if 'filter' in options:
            for feature in options['filter'].keys():
                mask = (mask & self.data_df[feature].isin(options['filter'][feature]))
        return mask

    def get_choropleth_data(self, df):
        borough_case_df = pd.DataFrame({
            'cases_count': df[['borough_id', 'borough_name']].value_counts().dropna()
        })

        if len(borough_case_df) == 0:
            return {
                'legend': [],
                'data': []
            }

        borough_case_df.index.name = 'borough_id'
        borough_case_df['percentage'] = borough_case_df / borough_case_df.max()
        borough_cases = borough_case_df.reset_index().to_dict(orient='records')
        result = {}

        for b in borough_cases:
            result[b['borough_id']] = {
                'cases_count': b['cases_count'],
                'percentage': b['percentage'],
                'borough_name': b['borough_name']
            }
        number_max_case = np.max(borough_case_df).cases_count
        return {
            'legend': [{ 'value': int(number_max_case / 5 * i), 'percentage': i * 20} for i in range(0, 5)],
            'data': result
        }

    def get_line_plot_data(self, df, options):
        result_df = df
        if 'period' in options:
            if options['period'] == 'week':
                result_df = df.groupby(df['Date'].dt.isocalendar().week).count()[['borough_id']]
            if options['period'] == 'month':
                result_df = df.groupby(df['Date'].dt.month).count()[['borough_id']]
        data = result_df.reset_index().rename(
            columns={'borough_id': 'y', result_df.index.name: 'x'}
        )
        x_lim = [0, 1]
        y_lim = [0, 1]
        if len(data) > 0:
            x_lim = [int(data['x'].min()), int(data['x'].max())]
            y_lim = [int(data['y'].min()), int(data['y'].max())]
        return {
            'x_lim': x_lim,
            'y_lim': y_lim,
            'data': data.to_dict(orient='records')
        }

    def trim_string(self, string, length):
        if len(string) > length:
            return string[:length] + '...'
        return string

    def get_bar_plot_data(self, df, options):
        series = pd.Series()
        period_name = ''
        if 'useBarTimeframe' in options and options['useBarTimeframe'] and 'period' in options:
            if ('field' in options) and options['useBarTimeframe']:
                if options['period'] == 'week':
                    period_name = 'Week'
                    series = df[options['field']].groupby(df['Date'].dt.isocalendar().week).value_counts()
                if options['period'] == 'month':
                    period_name = 'Month'
                    series = df[options['field']].groupby(df['Date'].dt.month).value_counts()
        elif 'field' in options:
            series = df[options['field']].value_counts()
        result = []
        group_list = series.keys().tolist()
        groups = []
        for group in group_list:
            if type(group) == str:
                groups.append({
                    'name': self.trim_string(group, 30)
                })
            else:
                group_period, group_name = group
                groups.append({
                    'period': f'{period_name} {group_period}',
                    'name': self.trim_string(group_name, 30)
                })
        values = series.values.tolist()
        for i in range(len(groups)):
            result.append({
                'group': groups[i],
                'value': values[i]
            })
        return result

    def get_data(self, options):
        mask = self.get_filter_mask(options)
        result_df = self.data_df[mask]
        line_plot_data = self.get_line_plot_data(result_df, options)
        choropleth_data = self.get_choropleth_data(result_df)
        result = {
            'choropleth': {
                'meta': {
                    'title': 'Choropleth (London Borough)',
                    'legend': choropleth_data['legend'],
                },
                'data': choropleth_data['data']
            },
            'line': {
                'meta': {
                    'title': 'Trend of cases',
                    'x_label': f'{options["period"].capitalize()}',
                    'y_label': 'Total Cases',
                    'x_lim': line_plot_data['x_lim'],
                    'y_lim': line_plot_data['y_lim']
                },
                'data': line_plot_data['data'],
            },
            'bar': {
                'meta': {
                    'title': 'Distribution of cases',
                    # 'x_label': '',
                    'y_label': 'Total Cases'
                },
                'data': self.get_bar_plot_data(result_df, options)
            }
        }
        return result
