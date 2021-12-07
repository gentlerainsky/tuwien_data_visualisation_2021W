import pandas as pd


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
        borough_case_df.index.name = 'borough_id'
        borough_case_df['percentile'] = borough_case_df.rank(pct=True)
        borough_cases = borough_case_df.reset_index().to_dict(orient='records')
        result = {}

        for b in borough_cases:
            result[b['borough_id']] = {
                'cases_count': b['cases_count'],
                'percentile': b['percentile'],
                'borough_name': b['borough_name']
            }
        return result

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
        return {
            'x_lim': [data['x'].min() * 0.9, data['x'].max() * 1.1],
            'y_lim': [data['y'].min() * 0.9, data['y'].max() * 1.1],
            'data': data.to_dict(orient='records')
        }
    def get_bar_plot_data(self, df, options):
        if 'field' in options:
            df = df[options['field']].value_counts()
        result = []
        groups = df.keys().tolist()
        values =df.values.tolist()
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
        result = {
            'choropleth': {
                'meta': {
                    'title': 'Choropleth of cases in London',
                },
                'data': self.get_choropleth_data(result_df),
            },
            'line': {
                'meta': {
                    'title': 'Trend of cases',
                    'x_label': f'{options["period"]}',
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
