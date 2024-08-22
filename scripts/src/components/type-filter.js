import $ from 'jquery'
import {chain, pick, omit, filter, defaults} from 'lodash'

import TmplListGroupItem from '../templates/list-group-item'
import {setContent, slugify, createDatasetFilters, collapseListGroup} from '../util'

export default class {
  constructor (opts) {
    const types = this._typesWithCount(opts.datasets, opts.params)
    const typesMarkup = types.map(TmplListGroupItem)
    setContent(opts.el, typesMarkup)
    collapseListGroup(opts.el)
  }

  // Given an array of datasets, returns an array of their categories with counts
  _typesWithCount (datasets, params) {
    return chain(datasets)
      .filter('type')
      .flatMap(function (value, index, collection) {
        // Explode objects where category is an array into one object per category
        if (typeof value.type === 'string') return value
        const duplicates = []
        value.type.forEach(function (type) {
          duplicates.push(defaults({type: type}, value))
        })
        return duplicates
      })
      .groupBy('type')
      .map(function (datasetsInCat, type) {
        const filters = createDatasetFilters(pick(params, ['type']))
        const filteredDatasets = filter(datasetsInCat, filters)
        const typeSlug = slugify(type)
        const selected = params.type && params.type === typeSlug
        const itemParams = selected ? omit(params, 'type') : defaults({type: typeSlug}, params)
        return {
          title: type,
          url: '?' + $.param(itemParams),
          count: filteredDatasets.length,
          unfilteredCount: datasetsInCat.length,
          selected: selected
        }
      })
      .orderBy('unfilteredCount', 'desc')
      .value()
  }
}
