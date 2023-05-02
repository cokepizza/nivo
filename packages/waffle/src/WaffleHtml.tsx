import { createElement, Fragment, ReactNode } from 'react'
import { Container, useDimensions } from '@nivo/core'
import { InheritedColorConfig, OrdinalColorScaleConfig } from '@nivo/colors'
import {
    Datum,
    CellComponent,
    HtmlProps,
    TooltipComponent,
    HtmlLayerId,
    ComputedDatum,
} from './types'
import { htmlDefaultProps } from './defaults'
import { useWaffle } from './hooks'
import { WaffleCellsHtml } from './WaffleCellsHtml'
import { WaffleAreasHtml } from './WaffleAreasHtml'

type InnerWaffleHtmlProps<D extends Datum> = Omit<
    HtmlProps<D>,
    'animate' | 'motionConfig' | 'renderWrapper' | 'theme'
>

const InnerWaffleHtml = <D extends Datum>({
    width,
    height,
    margin: partialMargin,
    data,
    valueFormat,
    total,
    rows,
    columns,
    fillDirection = htmlDefaultProps.fillDirection,
    padding = htmlDefaultProps.padding,
    layers = htmlDefaultProps.layers as HtmlLayerId[],
    cellComponent = htmlDefaultProps.cellComponent as unknown as CellComponent<D>,
    colors = htmlDefaultProps.colors as OrdinalColorScaleConfig<D>,
    emptyColor = htmlDefaultProps.emptyColor,
    // emptyOpacity = defaultProps.emptyOpacity,
    borderWidth = htmlDefaultProps.borderWidth,
    borderColor = htmlDefaultProps.borderColor as InheritedColorConfig<ComputedDatum<D>>,
    // defs = defaultProps.defs,
    // fill = defaultProps.fill,
    isInteractive = htmlDefaultProps.isInteractive,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
    onClick,
    tooltip = htmlDefaultProps.tooltip as TooltipComponent<D>,
    role = htmlDefaultProps.role,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    testIdPrefix,
}: InnerWaffleHtmlProps<D>) => {
    const { outerWidth, outerHeight, margin, innerWidth, innerHeight } = useDimensions(
        width,
        height,
        partialMargin
    )

    const { cells, cellSize, computedData } = useWaffle<D>({
        width: innerWidth,
        height: innerHeight,
        data,
        valueFormat,
        total,
        rows,
        columns,
        fillDirection,
        padding,
        colors,
        emptyColor,
        borderColor,
    })

    const layerById: Record<HtmlLayerId, ReactNode> = {
        cells: null,
        areas: null,
    }

    if (layers.includes('cells')) {
        layerById.cells = (
            <WaffleCellsHtml<D>
                key="cells"
                cells={cells}
                cellComponent={cellComponent}
                cellSize={cellSize}
                margin={margin}
                borderWidth={borderWidth}
                testIdPrefix={testIdPrefix}
            />
        )
    }

    if (layers.includes('areas')) {
        layerById.areas = (
            <WaffleAreasHtml<D>
                key="areas"
                data={computedData}
                margin={margin}
                isInteractive={isInteractive}
                onMouseEnter={onMouseEnter}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                onClick={onClick}
                tooltip={tooltip}
                testIdPrefix={testIdPrefix}
            />
        )
    }

    return (
        <div
            style={{
                position: 'relative',
                width: outerWidth,
                height: outerHeight,
            }}
            role={role}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
        >
            {layers.map((layer, i) => {
                if (typeof layer === 'function') {
                    return <Fragment key={i}>{createElement(layer)}</Fragment>
                }

                return layerById?.[layer] ?? null
            })}
        </div>
    )
}

export const WaffleHtml = <D extends Datum = Datum>({
    isInteractive = htmlDefaultProps.isInteractive,
    animate = htmlDefaultProps.animate,
    motionConfig = htmlDefaultProps.motionConfig,
    theme,
    renderWrapper,
    ...otherProps
}: HtmlProps<D>) => (
    <Container
        {...{
            animate,
            isInteractive,
            motionConfig,
            renderWrapper,
            theme,
        }}
    >
        <InnerWaffleHtml<D> isInteractive={isInteractive} {...otherProps} />
    </Container>
)