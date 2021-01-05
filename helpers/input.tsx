import BigNumber from 'bignumber.js'
import { TokenConfig } from 'components/blockchain/config'
import { BigNumberInput } from 'helpers/BigNumberInput'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'i18n'
import React, { ChangeEvent } from 'react'
import { createNumberMask } from 'text-mask-addons/dist/textMaskAddons'
import { Box, Button, Flex } from 'theme-ui'

interface InputWithSuffixProps {
  input: React.ReactElement<HTMLInputElement>
  suffix: JSX.Element | null
}

interface InputWithMaxProps {
  disabled?: boolean
  token: TokenConfig
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onSetMax: () => void
  hasError: boolean
  amount?: BigNumber
}

export function InputWithSuffix({ input, suffix }: InputWithSuffixProps) {
  return (
    <Box sx={{ position: 'relative' }}>
      {input}
      <Flex
        sx={{
          position: 'absolute',
          alignItems: 'center',
          top: '50%',
          transform: 'translateY(-50%)',
          right: 3,
        }}
      >
        {suffix}
      </Flex>
    </Box>
  )
}

export function InputWithMax({
  disabled,
  token,
  onChange,
  onSetMax,
  hasError,
  amount,
}: InputWithMaxProps) {
  const { t } = useTranslation()

  return (
    <InputWithSuffix
      input={
        <BigNumberInput
          type="text"
          disabled={disabled}
          mask={createNumberMask({
            allowDecimal: true,
            decimalLimit: token.digits,
            prefix: '',
          })}
          onChange={onChange}
          value={amount ? formatAmount(amount!, token.symbol) : null}
          placeholder={`0 ${token.symbol}`}
          variant={hasError ? 'inputError' : 'input'}
        />
      }
      suffix={
        <Button variant="secondary" onClick={onSetMax}>
          {t('max')}
        </Button>
      }
    />
  )
}