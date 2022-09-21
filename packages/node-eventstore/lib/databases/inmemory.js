var Store = require('../base'),
    _ = require('lodash'),
    jsondate = require('jsondate'),
    debug = require('debug')('@avanzu/eventstore/store/inmemory')

function deepFind(obj, pattern) {
    var found

    if (pattern) {
        var parts = pattern.split('.')

        found = obj
        for (var i in parts) {
            found = found[parts[i]]
            if (_.isArray(found)) {
                found = _.filter(found, (item) => {
                    var deepFound = deepFind(item, parts.slice(i + 1).join('.'))
                    return !!deepFound
                })
                break
            }

            if (!found) {
                break
            }
        }
    }

    return found
}

class InMemory extends Store {
    constructor(options) {
        super(options)
        this.store = {}
        this.snapshots = {}
        this.undispatchedEvents = { _direct: {} }
        this.options = options
        if (options.trackPosition) this.position = 0
    }
    connect() {
        return new Promise((Ok) => {
            this.emit('connect')
            Ok(this)
        })
    }

    disconnect() {
        return new Promise((Ok) => {
            this.emit('disconnect')
            Ok(this)
        })
    }

    clear() {
        return new Promise((Ok) => {
            this.store = {}
            this.snapshots = {}
            this.undispatchedEvents = { _direct: {} }
            this.position = 0
            Ok(this)
        })
    }

    getNextPositions(positions) {
        return new Promise((Ok) => {
            if (!this.options.trackPosition) {
                return Ok(null)
            }

            var range = []
            for (var i = 0; i < positions; i++) {
                range.push(++this.position)
            }
            Ok(range)
        })
    }

    addEvents(events) {
        return new Promise((Ok, Err) => {
            if (!events || events.length === 0) {
                return Ok(this)
            }

            var found = _.find(events, (evt) => {
                return !evt.aggregateId
            })

            if (found) {
                var errMsg = 'aggregateId not defined!'
                debug(errMsg)
                return Err(new Error(errMsg))
            }

            var aggregateId = events[0].aggregateId
            var aggregate = events[0].aggregate || '_general'
            var context = events[0].context || '_general'

            this.store[context] = this.store[context] || {}
            this.store[context][aggregate] = this.store[context][aggregate] || {}
            this.store[context][aggregate][aggregateId] =
                this.store[context][aggregate][aggregateId] || []
            this.store[context][aggregate][aggregateId] =
                this.store[context][aggregate][aggregateId].concat(events)

            this.undispatchedEvents[context] = this.undispatchedEvents[context] || {}
            this.undispatchedEvents[context][aggregate] =
                this.undispatchedEvents[context][aggregate] || {}
            this.undispatchedEvents[context][aggregate][aggregateId] =
                this.undispatchedEvents[context][aggregate][aggregateId] || []
            this.undispatchedEvents[context][aggregate][aggregateId] =
                this.undispatchedEvents[context][aggregate][aggregateId].concat(events)

            _.forEach(events, (evt) => {
                this.undispatchedEvents._direct[evt.id] = evt
            })

            Ok(this)
        })
    }

    getEvents(query, skip, limit) {
        return new Promise((Ok) => {
            var res = []
            for (var s in this.store) {
                for (var ss in this.store[s]) {
                    for (var sss in this.store[s][ss]) {
                        res = res.concat(this.store[s][ss][sss])
                    }
                }
            }

            res = _.sortBy(res, (e) => {
                return e.commitStamp.getTime()
            })

            if (!_.isEmpty(query)) {
                res = _.filter(res, (e) => {
                    var keys = _.keys(query)
                    var values = _.values(query)
                    var found = false
                    for (var i in keys) {
                        var key = keys[i]
                        var deepFound = deepFind(e, key)
                        if (_.isArray(deepFound) && deepFound.length > 0) {
                            found = true
                        } else if (deepFound === values[i]) {
                            found = true
                        } else {
                            found = false
                            break
                        }
                    }
                    return found
                })
            }

            if (limit === -1) {
                var res = _.cloneDeep(res.slice(skip))
                return Ok(res)
            }

            if (res.length <= skip) {
                return Ok([])
            }

            Ok(_.cloneDeep(res.slice(skip, skip + limit)))
        })
    }

    getEventsSince(date, skip, limit) {
        return new Promise((Ok) => {
            var res = []
            for (var s in this.store) {
                for (var ss in this.store[s]) {
                    for (var sss in this.store[s][ss]) {
                        res = res.concat(this.store[s][ss][sss])
                    }
                }
            }

            res = _.sortBy(res, (e) => {
                return e.commitStamp.getTime()
            })

            res = _.filter(res, (e) => {
                return e.commitStamp.getTime() >= date.getTime()
            })

            if (limit === -1) {
                var all = _.cloneDeep(res.slice(skip))
                return Ok(all)
            }

            if (res.length <= skip) {
                return Ok([])
            }

            Ok(_.cloneDeep(res.slice(skip, skip + limit)))
        })
    }

    getEventsByRevision(query, revMin, revMax) {
        return new Promise((Ok, Err) => {
            var res = []

            const resolveOk = (res) => {
                return Ok(_.cloneDeep(res))
            }

            if (!query.aggregateId) {
                var errMsg = 'aggregateId not defined!'
                debug(errMsg)
                return Err(new Error(errMsg))
            }

            if (query.context && query.aggregate) {
                this.store[query.context] = this.store[query.context] || {}
                this.store[query.context][query.aggregate] =
                    this.store[query.context][query.aggregate] || {}

                if (!this.store[query.context][query.aggregate][query.aggregateId]) {
                    return resolveOk(res)
                } else {
                    if (revMax === -1) {
                        res = res.concat(
                            this.store[query.context][query.aggregate][query.aggregateId].slice(
                                revMin
                            )
                        )
                    } else {
                        res = res.concat(
                            this.store[query.context][query.aggregate][query.aggregateId].slice(
                                revMin,
                                revMax
                            )
                        )
                    }
                }
                return resolveOk(res)
            }

            if (!query.context && query.aggregate) {
                for (var s in this.store) {
                    var c = this.store[s]
                    if (c[query.aggregate] && c[query.aggregate][query.aggregateId]) {
                        if (revMax === -1) {
                            res = res.concat(c[query.aggregate][query.aggregateId].slice(revMin))
                        } else {
                            res = res.concat(
                                c[query.aggregate][query.aggregateId].slice(revMin, revMax)
                            )
                        }
                    }
                }
                return resolveOk(res)
            }

            if (query.context && !query.aggregate) {
                var cc = this.store[query.context] || {}
                for (var ss in cc) {
                    var a = cc[ss]
                    if (a[query.aggregateId]) {
                        if (revMax === -1) {
                            res = res.concat(a[query.aggregateId].slice(revMin))
                        } else {
                            res = res.concat(a[query.aggregateId].slice(revMin, revMax))
                        }
                    }
                }
                return resolveOk(res)
            }

            if (!query.context && !query.aggregate) {
                for (var sc in this.store) {
                    var cont = this.store[sc]
                    for (var sa in cont) {
                        var agg = cont[sa]
                        if (agg[query.aggregateId]) {
                            if (revMax === -1) {
                                res = res.concat(agg[query.aggregateId].slice(revMin))
                            } else {
                                res = res.concat(agg[query.aggregateId].slice(revMin, revMax))
                            }
                        }
                    }
                }
                return resolveOk(res)
            }
        })
    }

    getLastEvent(query) {
        return new Promise((Ok, Err) => {
            if (!query.aggregateId) {
                var errMsg = 'aggregateId not defined!'
                debug(errMsg)
                return Err(new Error(errMsg))
            }

            var res = []
            for (var s in this.store) {
                for (var ss in this.store[s]) {
                    for (var sss in this.store[s][ss]) {
                        res = res.concat(this.store[s][ss][sss])
                    }
                }
            }

            res = _.sortBy(res, (e) => {
                return e.commitStamp.getTime()
            })

            if (!_.isEmpty(query)) {
                res = _.filter(res, (e) => {
                    var keys = _.keys(query)
                    var values = _.values(query)
                    var found = false
                    for (var i in keys) {
                        var key = keys[i]
                        var deepFound = deepFind(e, key)
                        if (_.isArray(deepFound) && deepFound.length > 0) {
                            found = true
                        } else if (deepFound === values[i]) {
                            found = true
                        } else {
                            found = false
                            break
                        }
                    }
                    return found
                })
            }

            Ok(res[res.length - 1])
        })
    }

    getUndispatchedEvents(query) {
        return new Promise((Ok) => {
            var res = []
            for (var s in this.undispatchedEvents) {
                if (s === '_direct') continue
                for (var ss in this.undispatchedEvents[s]) {
                    for (var sss in this.undispatchedEvents[s][ss]) {
                        res = res.concat(this.undispatchedEvents[s][ss][sss])
                    }
                }
            }

            res = _.sortBy(res, (e) => {
                return e.commitStamp.getTime()
            })

            if (!_.isEmpty(query)) {
                res = _.filter(res, (e) => {
                    var keys = _.keys(query)
                    var values = _.values(query)
                    var found = false
                    for (var i in keys) {
                        var key = keys[i]
                        var deepFound = deepFind(e, key)
                        if (_.isArray(deepFound) && deepFound.length > 0) {
                            found = true
                        } else if (deepFound === values[i]) {
                            found = true
                        } else {
                            found = false
                            break
                        }
                    }
                    return found
                })
            }

            Ok(res)
        })
    }

    setEventToDispatched(id) {
        return new Promise((Ok) => {
            var evt = this.undispatchedEvents._direct[id]
            var aggregateId = evt.aggregateId
            var aggregate = evt.aggregate || '_general'
            var context = evt.context || '_general'

            this.undispatchedEvents[context][aggregate][aggregateId] = _.reject(
                this.undispatchedEvents[context][aggregate][aggregateId],
                evt
            )
            delete this.undispatchedEvents._direct[id]
            Ok({ ok: 1 })
        })
    }

    addSnapshot(snap) {
        return new Promise((Ok, Err) => {
            var aggregateId = snap.aggregateId
            var aggregate = snap.aggregate || '_general'
            var context = snap.context || '_general'

            if (!snap.aggregateId) {
                var errMsg = 'aggregateId not defined!'
                debug(errMsg)
                Err(new Error(errMsg))
                return
            }

            this.snapshots[context] = this.snapshots[context] || {}
            this.snapshots[context][aggregate] = this.snapshots[context][aggregate] || {}
            this.snapshots[context][aggregate][aggregateId] =
                this.snapshots[context][aggregate][aggregateId] || []

            this.snapshots[context][aggregate][aggregateId].push(snap)
            Ok({ ok: 1 })
        })
    }

    getSnapshot(query, revMax) {
        return new Promise((Ok, Err) => {
            if (!query.aggregateId) {
                var errMsg = 'aggregateId not defined!'
                debug(errMsg)
                Err(new Error(errMsg))
                return
            }

            var all = []
            for (var s in this.snapshots) {
                for (var ss in this.snapshots[s]) {
                    for (var sss in this.snapshots[s][ss]) {
                        all = all.concat(this.snapshots[s][ss][sss])
                    }
                }
            }

            //    all = _.sortBy(all,  (s)  => {
            //      return [(-s.revision), (-s.version)].join('_');
            //    });

            all = _.sortBy(all, (s) => {
                return -s.commitStamp.getTime()
            })

            if (!_.isEmpty(query)) {
                all = _.filter(all, (a) => {
                    var keys = _.keys(query)
                    var values = _.values(query)
                    var found = false
                    for (var i in keys) {
                        var key = keys[i]
                        var deepFound = deepFind(a, key)
                        if (_.isArray(deepFound) && deepFound.length > 0) {
                            found = true
                        } else if (deepFound === values[i]) {
                            found = true
                        } else {
                            found = false
                            break
                        }
                    }
                    return found
                })
            }

            if (revMax === -1) {
                return Ok(all[0] ? jsondate.parse(JSON.stringify(all[0])) : null)
            } else {
                for (var i = all.length - 1; i >= 0; i--) {
                    if (all[i].revision <= revMax) {
                        return Ok(jsondate.parse(JSON.stringify(all[i])))
                    }
                }
            }
            Ok(null)
        })
    }

    cleanSnapshots(query) {
        return new Promise((Ok, Err) => {
            var aggregateId = query.aggregateId
            var aggregate = query.aggregate || '_general'
            var context = query.context || '_general'

            if (!aggregateId) {
                var errMsg = 'aggregateId not defined!'
                debug(errMsg)
                return Err(new Error(errMsg))
            }

            var snapshots = this.snapshots[context][aggregate][aggregateId] || []
            snapshots = snapshots.slice((-1 * this.options.maxSnapshotsCount) | 0)
            this.snapshots[context][aggregate][aggregateId] = snapshots

            Ok(snapshots.length)
        })
    }
}

module.exports = InMemory
