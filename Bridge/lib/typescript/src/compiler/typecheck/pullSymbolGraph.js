var TypeScript;
(function (TypeScript) {
    TypeScript.linkID = 0;

    var IListItem = (function () {
        function IListItem(value) {
            this.value = value;
            this.next = null;
            this.prev = null;
        }
        return IListItem;
    })();
    TypeScript.IListItem = IListItem;

    var LinkList = (function () {
        function LinkList() {
            this.head = null;
            this.last = null;
            this.length = 0;
        }
        LinkList.prototype.addItem = function (item) {
            if (!this.head) {
                this.head = new IListItem(item);
                this.last = this.head;
            } else {
                this.last.next = new IListItem(item);
                this.last.next.prev = this.last;
                this.last = this.last.next;
            }

            this.length++;
        };

        LinkList.prototype.find = function (p) {
            var node = this.head;
            var vals = [];

            while (node) {
                if (p(node.value)) {
                    vals[vals.length] = node.value;
                }
                node = node.next;
            }

            return vals;
        };

        LinkList.prototype.remove = function (p) {
            var node = this.head;
            var prev = null;
            var next = null;

            while (node) {
                if (p(node.value)) {
                    if (node === this.head) {
                        if (this.last === this.head) {
                            this.last = null;
                        }

                        this.head = this.head.next;

                        if (this.head) {
                            this.head.prev = null;
                        }
                    } else {
                        prev = node.prev;
                        next = node.next;

                        if (prev) {
                            prev.next = next;
                        }
                        if (next) {
                            next.prev = prev;
                        }

                        if (node === this.last) {
                            this.last = prev;
                        }
                    }

                    this.length--;
                }
                node = node.next;
            }
        };

        LinkList.prototype.update = function (map, context) {
            var node = this.head;

            while (node) {
                map(node.value, context);

                node = node.next;
            }
        };
        return LinkList;
    })();
    TypeScript.LinkList = LinkList;

    var PullSymbolLink = (function () {
        function PullSymbolLink(start, end, kind) {
            this.start = start;
            this.end = end;
            this.kind = kind;
            this.id = TypeScript.linkID++;
        }
        return PullSymbolLink;
    })();
    TypeScript.PullSymbolLink = PullSymbolLink;

    (function (GraphUpdateKind) {
        GraphUpdateKind[GraphUpdateKind["NoUpdate"] = 0] = "NoUpdate";

        GraphUpdateKind[GraphUpdateKind["SymbolRemoved"] = 1] = "SymbolRemoved";
        GraphUpdateKind[GraphUpdateKind["SymbolAdded"] = 2] = "SymbolAdded";

        GraphUpdateKind[GraphUpdateKind["TypeChanged"] = 3] = "TypeChanged";
    })(TypeScript.GraphUpdateKind || (TypeScript.GraphUpdateKind = {}));
    var GraphUpdateKind = TypeScript.GraphUpdateKind;

    var PullSymbolUpdate = (function () {
        function PullSymbolUpdate(updateKind, symbolToUpdate, updater) {
            this.updateKind = updateKind;
            this.symbolToUpdate = symbolToUpdate;
            this.updater = updater;
        }
        return PullSymbolUpdate;
    })();
    TypeScript.PullSymbolUpdate = PullSymbolUpdate;

    TypeScript.updateVersion = 0;

    var PullSymbolGraphUpdater = (function () {
        function PullSymbolGraphUpdater(semanticInfoChain) {
            this.semanticInfoChain = semanticInfoChain;
        }
        PullSymbolGraphUpdater.prototype.removeDecl = function (declToRemove) {
            var declSymbol = declToRemove.getSymbol();

            if (declSymbol) {
                declSymbol.removeDeclaration(declToRemove);

                var childDecls = declToRemove.getChildDecls();

                for (var i = 0; i < childDecls.length; i++) {
                    this.removeDecl(childDecls[i]);
                }

                var remainingDecls = declSymbol.getDeclarations();

                if (!remainingDecls.length) {
                    this.removeSymbol(declSymbol);

                    this.semanticInfoChain.removeSymbolFromCache(declSymbol);
                } else {
                    declSymbol.invalidate();
                }
            }

            var valDecl = declToRemove.getValueDecl();

            if (valDecl) {
                this.removeDecl(valDecl);
            }

            TypeScript.updateVersion++;
        };

        PullSymbolGraphUpdater.prototype.addDecl = function (declToAdd) {
            var symbolToAdd = declToAdd.getSymbol();

            if (symbolToAdd) {
                this.addSymbol(symbolToAdd);
            }

            TypeScript.updateVersion++;
        };

        PullSymbolGraphUpdater.prototype.removeSymbol = function (symbolToRemove) {
            if (symbolToRemove.removeUpdateVersion === TypeScript.updateVersion) {
                return;
            }

            symbolToRemove.removeUpdateVersion = TypeScript.updateVersion;

            symbolToRemove.updateOutgoingLinks(propagateRemovalToOutgoingLinks, new PullSymbolUpdate(GraphUpdateKind.SymbolRemoved, symbolToRemove, this));

            symbolToRemove.updateIncomingLinks(propagateRemovalToIncomingLinks, new PullSymbolUpdate(GraphUpdateKind.SymbolRemoved, symbolToRemove, this));

            symbolToRemove.unsetContainer();

            this.semanticInfoChain.removeSymbolFromCache(symbolToRemove);

            var container = symbolToRemove.getContainer();

            if (container) {
                container.removeMember(symbolToRemove);
                this.semanticInfoChain.removeSymbolFromCache(symbolToRemove);
            }

            if (symbolToRemove.isAccessor()) {
                var getterSymbol = (symbolToRemove).getGetter();
                var setterSymbol = (symbolToRemove).getSetter();

                if (getterSymbol) {
                    this.removeSymbol(getterSymbol);
                }

                if (setterSymbol) {
                    this.removeSymbol(setterSymbol);
                }
            }

            symbolToRemove.removeAllLinks();
        };

        PullSymbolGraphUpdater.prototype.addSymbol = function (symbolToAdd) {
            if (symbolToAdd.addUpdateVersion === TypeScript.updateVersion) {
                return;
            }

            symbolToAdd.addUpdateVersion = TypeScript.updateVersion;

            symbolToAdd.updateOutgoingLinks(propagateAdditionToOutgoingLinks, new PullSymbolUpdate(GraphUpdateKind.SymbolAdded, symbolToAdd, this));

            symbolToAdd.updateIncomingLinks(propagateAdditionToIncomingLinks, new PullSymbolUpdate(GraphUpdateKind.SymbolAdded, symbolToAdd, this));
        };

        PullSymbolGraphUpdater.prototype.invalidateType = function (symbolWhoseTypeChanged) {
            if (!symbolWhoseTypeChanged) {
                return;
            }

            if (symbolWhoseTypeChanged.isPrimitive()) {
                return;
            }

            if (symbolWhoseTypeChanged.typeChangeUpdateVersion === TypeScript.updateVersion) {
                return;
            }

            symbolWhoseTypeChanged.typeChangeUpdateVersion = TypeScript.updateVersion;

            symbolWhoseTypeChanged.updateOutgoingLinks(propagateChangedTypeToOutgoingLinks, new PullSymbolUpdate(GraphUpdateKind.TypeChanged, symbolWhoseTypeChanged, this));

            symbolWhoseTypeChanged.updateIncomingLinks(propagateChangedTypeToIncomingLinks, new PullSymbolUpdate(GraphUpdateKind.TypeChanged, symbolWhoseTypeChanged, this));

            if (symbolWhoseTypeChanged.getKind() === TypeScript.PullElementKind.Container) {
                var instanceSymbol = (symbolWhoseTypeChanged).getInstanceSymbol();

                this.invalidateType(instanceSymbol);
            }

            if (symbolWhoseTypeChanged.isResolved()) {
                symbolWhoseTypeChanged.invalidate();
            }

            this.invalidateUnitsForSymbol(symbolWhoseTypeChanged);
        };

        PullSymbolGraphUpdater.prototype.invalidateUnitsForSymbol = function (symbol) {
            var declarations = symbol.getDeclarations();

            for (var i = 0; i < declarations.length; i++) {
                this.semanticInfoChain.invalidateUnit(declarations[i].getScriptName());
            }
        };
        return PullSymbolGraphUpdater;
    })();
    TypeScript.PullSymbolGraphUpdater = PullSymbolGraphUpdater;

    function propagateRemovalToOutgoingLinks(link, update) {
        var symbolToRemove = update.symbolToUpdate;
        var affectedSymbol = link.end;

        if (affectedSymbol.removeUpdateVersion === TypeScript.updateVersion || affectedSymbol.isPrimitive()) {
            return;
        }

        if (link.kind === TypeScript.SymbolLinkKind.ProvidesInferredType) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.SpecializedTo) {
            (symbolToRemove).removeSpecialization(affectedSymbol);
            update.updater.removeSymbol(affectedSymbol);
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.PublicMember) {
            update.updater.removeSymbol(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.PrivateMember) {
            update.updater.removeSymbol(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.ConstructorMethod) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.ContainedBy) {
            (affectedSymbol).removeMember(symbolToRemove);
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.Parameter) {
            update.updater.removeSymbol(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.CallSignature) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.ConstructSignature) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.IndexSignature) {
            update.updater.invalidateType(affectedSymbol);
        }

        symbolToRemove.removeOutgoingLink(link);
    }
    TypeScript.propagateRemovalToOutgoingLinks = propagateRemovalToOutgoingLinks;

    function propagateRemovalToIncomingLinks(link, update) {
        var symbolToRemove = update.symbolToUpdate;
        var affectedSymbol = link.start;

        if (affectedSymbol.removeUpdateVersion === TypeScript.updateVersion || affectedSymbol.isPrimitive()) {
            return;
        }

        if (link.kind === TypeScript.SymbolLinkKind.TypedAs) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.ContextuallyTypedAs) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.TypeParameter) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.TypeArgument) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.SpecializedTo) {
            (affectedSymbol).removeSpecialization(symbolToRemove);
        } else if (link.kind === TypeScript.SymbolLinkKind.TypeConstraint) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.PublicMember) {
            (affectedSymbol).removeMember(symbolToRemove);
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.PrivateMember) {
            (affectedSymbol).removeMember(symbolToRemove);
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.ConstructorMethod) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.ContainedBy) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.Extends) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.Implements) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.Parameter) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.ReturnType) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.CallSignature) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.ConstructSignature) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.IndexSignature) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.Aliases) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.ExportAliases) {
            update.updater.invalidateType(affectedSymbol);
        }
    }
    TypeScript.propagateRemovalToIncomingLinks = propagateRemovalToIncomingLinks;

    function propagateAdditionToOutgoingLinks(link, update) {
        var symbolToAdd = update.symbolToUpdate;
        var affectedSymbol = link.end;

        if (affectedSymbol.addUpdateVersion === TypeScript.updateVersion || affectedSymbol.isPrimitive()) {
            return;
        }

        if (link.kind === TypeScript.SymbolLinkKind.ContainedBy) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.ProvidesInferredType) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.TypeParameter) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.TypeArgument) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.SpecializedTo) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.TypeConstraint) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.PublicMember) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.ConstructorMethod) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.ReturnType) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.CallSignature) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.ConstructSignature) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.IndexSignature) {
            update.updater.invalidateType(affectedSymbol);
        }
    }
    TypeScript.propagateAdditionToOutgoingLinks = propagateAdditionToOutgoingLinks;

    function propagateAdditionToIncomingLinks(link, update) {
        var symbolToAdd = update.symbolToUpdate;
        var affectedSymbol = link.start;

        if (affectedSymbol.addUpdateVersion === TypeScript.updateVersion || affectedSymbol.isPrimitive()) {
            return;
        }

        if (link.kind === TypeScript.SymbolLinkKind.TypedAs) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.ContextuallyTypedAs) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.TypeParameter) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.TypeArgument) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.TypeConstraint) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.PublicMember) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.ConstructorMethod) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.Extends) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.Implements) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.ReturnType) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.Aliases) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.ExportAliases) {
            update.updater.invalidateType(affectedSymbol);
        }
    }
    TypeScript.propagateAdditionToIncomingLinks = propagateAdditionToIncomingLinks;

    function propagateChangedTypeToOutgoingLinks(link, update) {
        var symbolWhoseTypeChanged = update.symbolToUpdate;
        var affectedSymbol = link.end;

        if (affectedSymbol.typeChangeUpdateVersion === TypeScript.updateVersion || affectedSymbol.isPrimitive()) {
            return;
        }

        if (link.kind === TypeScript.SymbolLinkKind.ProvidesInferredType) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.ContainedBy) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.TypeParameter) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.TypeArgument) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.SpecializedTo) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.TypeConstraint) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.PublicMember) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.CallSignature) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.ConstructorMethod) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.ConstructSignature) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.IndexSignature) {
            update.updater.invalidateType(affectedSymbol);
        }
    }
    TypeScript.propagateChangedTypeToOutgoingLinks = propagateChangedTypeToOutgoingLinks;

    function propagateChangedTypeToIncomingLinks(link, update) {
        var symbolWhoseTypeChanged = update.symbolToUpdate;
        var affectedSymbol = link.start;

        if (affectedSymbol.typeChangeUpdateVersion === TypeScript.updateVersion || affectedSymbol.isPrimitive()) {
            return;
        }

        if (link.kind === TypeScript.SymbolLinkKind.TypedAs) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.ContextuallyTypedAs) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.TypeParameter) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.TypeArgument) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.TypeConstraint) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.PublicMember) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.IndexSignature) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.Extends) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.Implements) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.ReturnType) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.Aliases) {
            update.updater.invalidateType(affectedSymbol);
        } else if (link.kind === TypeScript.SymbolLinkKind.ExportAliases) {
            update.updater.invalidateType(affectedSymbol);
        }
    }
    TypeScript.propagateChangedTypeToIncomingLinks = propagateChangedTypeToIncomingLinks;
})(TypeScript || (TypeScript = {}));
